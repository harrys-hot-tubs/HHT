import { calculateHirePrice } from '@pages/api/tubs/[id]'
import { ConnectedRequest } from '@typings/api'
import { APIError } from '@typings/api/Error'
import {
	PaymentIntentRequest,
	UpdatePaymentRequest
} from '@typings/api/Payment'
import db from '@utils/db'
import { formatAmount, priceToString } from '@utils/stripe'
import { differenceInDays } from 'date-fns'
import { toUpper } from 'lodash'
import { NextApiResponse } from 'next'
import { Stripe } from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET, {
	apiVersion: '2020-08-27',
})

async function handler(req: ConnectedRequest, res: NextApiResponse) {
	switch (req.method) {
		case 'POST':
			return post(req, res)
		case 'PATCH':
			return patch(req, res)
		default:
			res.setHeader('Allow', 'POST')
			res.status(405).end('Method not allowed.')
	}
}

const post = async (
	req: ConnectedRequest<PaymentIntentRequest>,
	res: NextApiResponse<
		Pick<Stripe.PaymentIntent, 'client_secret' | 'id'> | APIError
	>
) => {
	const {
		db,
		body: { tubID, startDate, endDate },
	} = req
	try {
		const parsedStartDate = new Date(startDate)
		const parsedEndDate = new Date(endDate)
		if (differenceInDays(parsedEndDate, parsedStartDate) <= 0)
			throw new RangeError('Order duration must be greater than 0.')

		const price = await calculateHirePrice(
			{
				tubID,
				startDate: parsedStartDate,
				endDate: parsedEndDate,
			},
			db
		)

		if (price < 0.3)
			throw new RangeError(
				'Price must be greater than stripe minimum charge (£0.30)'
			)

		const paymentIntent: Stripe.PaymentIntent =
			await stripe.paymentIntents.create({
				payment_method_types: ['card'],
				amount: formatAmount(price),
				currency: 'gbp',
				description: `Booking from ${parsedStartDate.toLocaleDateString()} to ${parsedEndDate.toLocaleDateString()} for tub ${tubID}.`,
			})

		res.status(200).json({
			client_secret: paymentIntent.client_secret,
			id: paymentIntent.id,
		})
	} catch (error) {
		if (error instanceof RangeError) {
			return res
				.status(400)
				.json({ type: 'RangeError', message: error.message })
		} else if (error instanceof ReferenceError) {
			return res
				.status(400)
				.json({ type: 'ReferenceError', message: error.message })
		} else {
			console.error(error.message)
			return res.status(500).json({ type: 'Error', message: error.message })
		}
	}
}

const patch = async (
	req: ConnectedRequest<UpdatePaymentRequest>,
	res: NextApiResponse<
		Pick<Stripe.PaymentIntent, 'client_secret' | 'id'> | APIError
	>
) => {
	const {
		body: { paymentIntentID, promoCode },
	} = req

	const payment = await stripe.paymentIntents.retrieve(paymentIntentID)

	if (payment.status !== 'requires_payment_method')
		return res.status(400).json({
			type: 'StatusError',
			message: 'Payment intent must be in requires_payment_method state.',
		})

	if (toUpper(payment.metadata['promoCode']) === toUpper(promoCode))
		return res.status(400).json({
			type: 'StatusError',
			message: `Discount code ${promoCode} already applied.`,
		})

	const promotionCodes = await stripe.promotionCodes.list({ code: promoCode })

	if (promotionCodes.data.length === 0)
		return res.status(400).json({
			type: 'Error',
			message: `Discount code ${promoCode} does not exist.`,
		})

	if (promotionCodes.data.every((promotionCode) => !promotionCode.active))
		return res.status(400).json({
			type: 'StatusError',
			message: `${promoCode} is not an active discount code.`,
		})

	if (
		promotionCodes.data.every((promotionCode) =>
			promotionCode.max_redemptions
				? promotionCode.times_redeemed > promotionCode.max_redemptions
				: false
		)
	)
		return res.status(400).json({
			type: 'StatusError',
			message: `${promoCode} has already been used too many times.`,
		})

	if (
		promotionCodes.data.every((promotionCode) => {
			return (
				promotionCode.expires_at &&
				new Date(promotionCode.expires_at) < new Date()
			)
		})
	)
		return res
			.status(400)
			.json({ type: 'StatusError', message: `${promoCode} has expired.` })

	if (
		promotionCodes.data.every(
			(promotionCode) =>
				promotionCode.restrictions.minimum_amount > payment.amount
		)
	)
		return res.status(400).json({
			type: 'RangeError',
			message: `The discount code ${promoCode} can only be applied to payments greater than ${priceToString(
				payment.amount
			)}.`,
		})

	try {
		const originalAmount = payment.metadata['originalAmount']
			? Number(payment.metadata['originalAmount'])
			: payment.amount

		const filteredPromotionCodes = filterValidPromotionCodes(
			promotionCodes.data,
			originalAmount
		)
		if (filteredPromotionCodes.length === 0)
			return res.status(400).json({
				type: 'StatusError',
				message: `${promoCode} can not be applied.`,
			})

		const [bestPromotionCode, bestPrice] = findBestPromotionCode(
			filteredPromotionCodes,
			originalAmount
		)

		const newPaymentIntent = await stripe.paymentIntents.update(
			paymentIntentID,
			{
				amount: Math.round(bestPrice),
				metadata: {
					promoCode: bestPromotionCode.code,
					originalAmount,
				},
			}
		)
		return res.status(200).json({
			client_secret: newPaymentIntent.client_secret,
			id: newPaymentIntent.id,
		})
	} catch (error) {
		console.error(error.message)
		return res.status(500).json({ type: 'Error', message: error.message })
	}
}

const filterValidPromotionCodes = (
	promotionCodes: Array<Stripe.PromotionCode>,
	originalAmount: number
): Array<Stripe.PromotionCode> =>
	// Filters out promotion codes that have expired, been redeemed too many times, are no longer active, or cannot be applied to this purchase.
	promotionCodes.filter(
		(promotionCode) =>
			promotionCode.active &&
			(promotionCode.max_redemptions
				? promotionCode.times_redeemed < promotionCode.max_redemptions
				: true) &&
			(promotionCode.expires_at
				? new Date(promotionCode.expires_at) < new Date()
				: true) &&
			(promotionCode.restrictions.minimum_amount
				? promotionCode.restrictions.minimum_amount < originalAmount
				: true)
	)

/**
 * Finds the promotion code that reduces the price paid to the lowest possible amount.
 *
 * @param {PromotionCode[]} promotionCodes The promotion codes that can be applied to the payment.
 * @param {number} price The current price of the booking.
 *
 * @returns {PromotionCode} The promotion code that reduces the price to the lowest possible amount.
 */
const findBestPromotionCode = (
	promotionCodes: Stripe.PromotionCode[],
	amount: number
): [Stripe.PromotionCode, number] => {
	let bestPromotionCode = promotionCodes[0]
	let bestPrice = amount
	promotionCodes.forEach((promotionCode) => {
		if (promotionCode.coupon.amount_off) {
			const newPrice = amount - promotionCode.coupon.amount_off
			if (newPrice < bestPrice) {
				bestPrice = newPrice
				bestPromotionCode = promotionCode
			}
		} else if (promotionCode.coupon.percent_off) {
			const newPrice = amount * (1 - promotionCode.coupon.percent_off / 100)
			if (newPrice < bestPrice) {
				bestPrice = newPrice
				bestPromotionCode = promotionCode
			}
		}
	})

	return [bestPromotionCode, bestPrice]
}

export default db()(handler)
