import { CheckoutRequest } from '@typings/api/Checkout'
import { APIError } from '@typings/api/Error'
import { momentToString, stringToMoment } from '@utils/date'
import { formatAmount } from '@utils/stripe'
import { NextApiRequest, NextApiResponse } from 'next'
import { Stripe } from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET, {
	apiVersion: '2020-08-27',
})

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	switch (req.method) {
		case 'POST':
			return await post(req, res)
		default:
			res.setHeader('Allow', 'POST')
			res.status(405).end('Method not allowed.')
	}
}

const post = async (
	req: NextApiRequest,
	res: NextApiResponse<Stripe.Checkout.Session | APIError>
) => {
	const { price, startDate, endDate } = req.body as CheckoutRequest
	try {
		const parsedStartDate = stringToMoment(startDate)
		const parsedEndDate = stringToMoment(endDate)

		const params: Stripe.Checkout.SessionCreateParams = {
			mode: 'payment',
			submit_type: 'pay',
			payment_method_types: ['card'],
			line_items: [
				{
					name: `Booking from ${momentToString(
						parsedStartDate
					)} to ${momentToString(parsedEndDate)}.`,
					amount: formatAmount(price),
					currency: process.env.STRIPE_CURRENCY,
					quantity: 1,
				},
				{
					name: `Refundable Security Deposit`,
					amount: formatAmount(70),
					currency: process.env.STRIPE_CURRENCY,
					quantity: 1,
				},
			],
			success_url: `${req.headers.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
			cancel_url: `${req.headers.origin}/failure`,
		}

		const checkoutSession: Stripe.Checkout.Session = await stripe.checkout.sessions.create(
			params
		)

		res.status(200).json(checkoutSession)
	} catch (e) {
		console.error(e.message)
		res.status(500).json({ statusCode: 500, message: e.message })
	}
}
