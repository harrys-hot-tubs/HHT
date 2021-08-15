import { ConnectedRequest } from '@typings/api'
import { APIErrorResponse } from '@typings/api/Error'
import db from '@utils/db'
import { NextApiResponse } from 'next'
import { Stripe } from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET, {
	apiVersion: '2020-08-27',
})

async function handler(req: ConnectedRequest, res: NextApiResponse) {
	switch (req.method) {
		case 'GET':
			return get(req, res)
		default:
			res.setHeader('Allow', ['GET'])
			res.status(405).end('Method not allowed.')
	}
}

const get = async (
	req: ConnectedRequest,
	res: NextApiResponse<
		Pick<Stripe.PaymentIntent, 'metadata' | 'amount'> | APIErrorResponse
	>
) => {
	try {
		const {
			query: { id },
		} = req
		const intent = await stripe.paymentIntents.retrieve(String(id))
		return res
			.status(200)
			.json({ metadata: intent.metadata, amount: intent.amount })
	} catch (error) {
		console.error(error.message)
		return res
			.status(400)
			.json({ type: 'NotFoundError', message: error.message })
	}
}

export default db()(handler)
