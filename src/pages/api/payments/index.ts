import { calculateHirePrice } from '@pages/api/tubs/[id]'
import { ConnectedRequest } from '@typings/api'
import { APIError } from '@typings/api/Error'
import { PaymentIntentRequest } from '@typings/api/Payment'
import db from '@utils/db'
import { formatAmount } from '@utils/stripe'
import { differenceInDays } from 'date-fns'
import { NextApiResponse } from 'next'
import { Stripe } from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET, {
	apiVersion: '2020-08-27',
})

async function handler(req: ConnectedRequest, res: NextApiResponse) {
	switch (req.method) {
		case 'POST':
			return post(req, res)
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
				amount: formatAmount(price + 70),
				currency: 'gbp',
				metadata: {
					integration_check: 'accept_a_payment',
				},
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

export default db()(handler)
