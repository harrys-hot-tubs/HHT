import { calculateHirePrice } from '@pages/api/tubs/[id]'
import { ConnectedRequest } from '@typings/api'
import { APIErrorResponse } from '@typings/api/Error'
import {
	ApplyPromoCodeRequest,
	CashOnDeliveryRequest,
	PaymentIntentRequest,
	UpdatePaymentRequest,
} from '@typings/api/Payment'
import db from '@utils/db'
import {
	isAPIError,
	NotFoundError,
	StatusError,
	UnexpectedError,
} from '@utils/errors'
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
			res.setHeader('Allow', ['POST', 'PATCH'])
			res.status(405).end('Method not allowed.')
	}
}

const post = async (
	req: ConnectedRequest<PaymentIntentRequest>,
	res: NextApiResponse<
		Pick<Stripe.PaymentIntent, 'client_secret' | 'id'> | APIErrorResponse
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
				.json({ type: 'NotFoundError', message: error.message })
		} else {
			console.error(error.message)
			return res
				.status(500)
				.json({ type: 'UnexpectedError', message: error.message })
		}
	}
}

const patch = async (
	req: ConnectedRequest<UpdatePaymentRequest>,
	res: NextApiResponse<
		Pick<Stripe.PaymentIntent, 'client_secret' | 'id'> | APIErrorResponse
	>
) => {
	const {
		body: { paymentIntentID, type: requestType },
	} = req

	const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentID)

	if (paymentIntent.status !== 'requires_payment_method')
		return res.status(400).json({
			type: 'StatusError',
			message: 'Payment intent must be in requires_payment_method state.',
		})

	switch (requestType) {
		case 'CASH_ON_DELIVERY':
			try {
				const { clientSecret, paymentIntentID } = await updateCashOnDelivery(
					paymentIntent,
					(req.body as CashOnDeliveryRequest).cashOnDelivery
				)
				return res
					.status(200)
					.json({ client_secret: clientSecret, id: paymentIntentID })
			} catch (error) {
				console.error(error.message)
				if (isAPIError(error)) {
					if (error.type === 'UnexpectedError') {
						return res
							.status(500)
							.json({ type: 'UnexpectedError', message: error.message })
					} else {
						return res
							.status(400)
							.json({ type: error.type, message: error.message })
					}
				}
			}
		case 'PROMO_CODE':
			try {
				const { clientSecret, paymentIntentID } = await applyPromoCode(
					paymentIntent,
					req.body as ApplyPromoCodeRequest
				)
				return res
					.status(200)
					.json({ client_secret: clientSecret, id: paymentIntentID })
			} catch (error) {
				console.error(error.message)
				if (isAPIError(error)) {
					if (error.type === 'UnexpectedError') {
						return res
							.status(500)
							.json({ type: 'UnexpectedError', message: error.message })
					} else {
						return res
							.status(400)
							.json({ type: error.type, message: error.message })
					}
				}
			}

		default:
			return res.status(400).json({
				type: 'InvalidRequestError',
				message: 'Cannot make an update to this property.',
			})
	}
}

/**
 * Toggles the state of a payment intent between being
 */
const updateCashOnDelivery = async (
	paymentIntent: Stripe.PaymentIntent,
	cashOnDelivery: boolean
): Promise<{ clientSecret: string; paymentIntentID: string }> => {
	try {
		const metadata = paymentIntent.metadata
		// Extract the original price for this payment intent from the metadata, if it exists.
		const originalAmount = paymentIntent.metadata['original_amount']
			? Number(paymentIntent.metadata['original_amount'])
			: paymentIntent.amount
		const deposit = calculateDeposit(paymentIntent.amount)
		let params: Stripe.PaymentIntentUpdateParams = {}

		if (cashOnDelivery) {
			// Update payment intent with new amount.
			params = {
				amount: Math.round(deposit),
				metadata: {
					...metadata,
					remainder_to_be_paid: paymentIntent.amount - deposit,
					cash_on_delivery: 'true',
					original_amount: originalAmount,
				},
			}
		} else {
			const remainder = Number(paymentIntent.metadata.remainder_to_be_paid) || 0

			params = {
				amount: Math.round(paymentIntent.amount + remainder),
				metadata: {
					...metadata,
					remainder_to_be_paid: 0,
					cash_on_delivery: 'false',
				},
			}
		}

		const updatedPaymentIntent = await stripe.paymentIntents.update(
			paymentIntent.id,
			params
		)

		return {
			clientSecret: updatedPaymentIntent.client_secret,
			paymentIntentID: updatedPaymentIntent.id,
		}
	} catch (error) {
		throw new UnexpectedError(error.message)
	}
}

/**
 * Calculates the deposit amount for the amount of a payment intent.
 *
 * @param amount The amount to calculate the deposit for.
 * @returns The calculated deposit amount.
 */
export const calculateDeposit = (amount: number): number => {
	if (amount > 60 * 100) {
		return 60 * 100
	} else {
		return Math.round(amount * 0.8)
	}
}

/**
 * Applies a promotion code to an existing payment intent.
 *
 * @param {Stripe.PaymentIntent} paymentIntent The payment intent to apply the code to.
 * @param {ApplyPromoCodeRequest} request The request containing the promotion code.
 *
 * @returns {Promise<{ clientSecret: string; paymentIntentID: string }>} A promise that resolves when the code has been applied.
 * @throws {NotFoundError} If the promotion code does not exist.
 * @throws {StatusError} If the promotion code cannot be applied to the purchase due to either its status or the status of the purchase.
 * @throws {RangeError} If the promotion code can only be applied to purchases above a certain value.
 */
const applyPromoCode = async (
	paymentIntent: Stripe.PaymentIntent,
	req: ApplyPromoCodeRequest
): Promise<{ clientSecret: string; paymentIntentID: string }> => {
	const { promoCode } = req

	if (isPromoCodeAlreadyApplied(paymentIntent, promoCode))
		throw new StatusError(`Discount code ${promoCode} already applied.`)

	// Get all discount information for promo codes that match the one provided.
	const { data: promoCodes } = await stripe.promotionCodes.list({
		code: promoCode,
	})

	if (promoCodes.length === 0)
		throw new NotFoundError(`Discount code ${promoCode} does not exist.`)

	if (!activePromoCodeExists(promoCodes))
		throw new StatusError(`${promoCode} is not an active discount code.`)

	if (!isNotFullyRedeemed(promoCodes))
		throw new StatusError(`${promoCode} has already been used too many times.`)

	if (!unexpiredPromoCodeExists(promoCodes))
		throw new StatusError(`${promoCode} has expired.`)

	if (!isAboveMinimumAmount(promoCodes, paymentIntent.amount))
		throw new RangeError(
			`The discount code ${promoCode} can only be applied to payments greater than ${priceToString(
				paymentIntent.amount
			)}.`
		)

	// Extract the original price for this payment intent from the metadata, if it exists.
	const originalAmount = paymentIntent.metadata['original_amount']
		? Number(paymentIntent.metadata['original_amount'])
		: paymentIntent.amount

	// Filter promo codes to those that are valid on all counts.
	const validPromoCodes = filterValidPromotionCodes(promoCodes, originalAmount)

	if (validPromoCodes.length === 0)
		throw new StatusError(`${promoCode} cannot be applied to this purchase.`)

	// If any valid promo codes exist, find the best one.
	const [bestPromoCode, bestPrice] = findBestPromotionCode(
		validPromoCodes,
		originalAmount
	)

	try {
		let params: Stripe.PaymentIntentUpdateParams = {}
		const metadata = paymentIntent.metadata

		// If cash on delivery is enabled, update the total payment to reflect the discount.
		if (metadata.cash_on_delivery === 'true') {
			const newDeposit = Math.round(calculateDeposit(bestPrice))
			const newRemainder = bestPrice - newDeposit
			params = {
				amount: newDeposit,
				metadata: {
					...metadata,
					promoCode: bestPromoCode.code,
					remainder_to_be_paid: newRemainder,
					original_amount: originalAmount,
				},
			}
		} else {
			params = {
				amount: Math.round(bestPrice),
				metadata: {
					...metadata,
					promoCode: bestPromoCode.code,
					original_amount: originalAmount,
				},
			}
		}
		// Update payment intent with new amount.
		const updatedPaymentIntent = await stripe.paymentIntents.update(
			paymentIntent.id,
			params
		)

		return {
			clientSecret: updatedPaymentIntent.client_secret,
			paymentIntentID: updatedPaymentIntent.id,
		}
	} catch (error) {
		throw new UnexpectedError(error.message)
	}
}

/**
 * Checks the metadata of a payment intent to see if a promotion code has already been applied.
 *
 * @param {Stripe.PaymentIntent} paymentIntent The payment intent to check.
 * @param {string} promoCode The promotion code to check.
 * @returns {boolean} True if the code has already been applied, false otherwise.
 */
const isPromoCodeAlreadyApplied = (
	paymentIntent: Stripe.PaymentIntent,
	promoCode: string
) => toUpper(paymentIntent.metadata['promoCode']) === toUpper(promoCode)

/**
 * Checks an array of promotion codes to see if any are active and can be applied to a purchase.
 *
 * @param {Array<Stripe.PromotionCode>} promoCodes The array of promotion codes to check.
 * @returns {boolean} True if at least one of the codes is active, false otherwise.
 */
const activePromoCodeExists = (promoCodes: Stripe.PromotionCode[]): boolean =>
	promoCodes.some((promotionCode) => promotionCode.active)

/**
 * Checks an array of promotion codes to see if there are any that are not expired and can be applied to a purchase.
 *
 * @param {Array<Stripe.PromotionCode>} promoCodes The array of promotion codes to check.
 * @returns {boolean} True if at least one of the codes has not yet expired, false otherwise.
 */
const unexpiredPromoCodeExists = (
	promoCodes: Stripe.PromotionCode[]
): boolean =>
	promoCodes.some((promoCode) => {
		return promoCode.expires_at
			? new Date(promoCode.expires_at) < new Date()
			: true
	})

/**
 * Checks an array of promotion codes to see if there are any that have not exceeded their maximum allowed redemptions.
 *
 * @param {Array<Stripe.PromotionCode>} promoCodes The array of promotion codes to check.
 * @returns {boolean} True if at least one of the codes has not exceeded its maximum allowed redemptions, false otherwise.
 */
const isNotFullyRedeemed = (promoCodes: Stripe.PromotionCode[]): boolean =>
	promoCodes.some((promoCode) => {
		return promoCode.max_redemptions
			? promoCode.times_redeemed < promoCode.max_redemptions
			: true
	})

/**
 * Checks an array of promotion codes to see if there are any which have a lower minimum amount than the purchase amount.
 *
 * @param {Array<Stripe.PromotionCode>} promoCodes The array of promotion codes to check.
 * @param {number} amount The amount of the purchase.
 * @returns {boolean} True if at least one of the codes has a lower minimum amount than the purchase amount, false otherwise.
 */
const isAboveMinimumAmount = (
	promoCodes: Stripe.PromotionCode[],
	amount: number
): boolean =>
	promoCodes.some((promoCode) => {
		return promoCode.restrictions.minimum_amount
			? promoCode.restrictions.minimum_amount > amount
			: true
	})

/**
 * Filters out promotion codes that have expired, been redeemed too many times, are no longer active, or cannot be applied to this purchase.
 *
 * @param {PromotionCode[]} promoCodes All promotion codes that have could conceivably be applied to the purchase.
 * @param {number} originalAmount The original amount of the purchase.
 *
 * @returns {PromotionCode[]} The filtered promotion codes.
 */
const filterValidPromotionCodes = (
	promoCodes: Array<Stripe.PromotionCode>,
	originalAmount: number
): Array<Stripe.PromotionCode> =>
	promoCodes.filter(
		(promoCode) =>
			promoCode.active &&
			(promoCode.max_redemptions
				? promoCode.times_redeemed < promoCode.max_redemptions
				: true) &&
			(promoCode.expires_at
				? new Date(promoCode.expires_at) < new Date()
				: true) &&
			(promoCode.restrictions.minimum_amount
				? promoCode.restrictions.minimum_amount < originalAmount
				: true)
	)

/**
 * Finds the promotion code that reduces the price paid to the lowest possible amount.
 *
 * @param {PromotionCode[]} promoCodes The promotion codes that can be applied to the payment.
 * @param {number} price The current price of the booking.
 *
 * @returns {PromotionCode} The promotion code that reduces the price to the lowest possible amount.
 */
const findBestPromotionCode = (
	promoCodes: Stripe.PromotionCode[],
	amount: number
): [Stripe.PromotionCode, number] => {
	let bestPromoCode = promoCodes[0]
	let bestPrice = amount
	promoCodes.forEach((promoCode) => {
		if (promoCode.coupon.amount_off) {
			const newPrice = amount - promoCode.coupon.amount_off
			if (newPrice < bestPrice) {
				bestPrice = newPrice
				bestPromoCode = promoCode
			}
		} else if (promoCode.coupon.percent_off) {
			const newPrice = amount * (1 - promoCode.coupon.percent_off / 100)
			if (newPrice < bestPrice) {
				bestPrice = newPrice
				bestPromoCode = promoCode
			}
		}
	})

	return [bestPromoCode, bestPrice]
}

export default db()(handler)
