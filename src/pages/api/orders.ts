import { CreateOrderRequest } from '@typings/api/Order'
import { ConnectedRequest } from '@typings/api/Request'
import { BookingDB } from '@typings/db/Booking'
import { OrderDB } from '@typings/db/Order'
import db from '@utils/db'
import { forEachAsync } from '@utils/index'
import moment from 'moment'
import { NextApiResponse } from 'next'
import Stripe from 'stripe'

const stripe: Stripe = new Stripe(process.env.STRIPE_SECRET, {
	apiVersion: '2020-08-27',
})

async function handler(req: ConnectedRequest, res: NextApiResponse) {
	switch (req.method) {
		case 'POST':
			return await post(req, res)
		case 'DELETE':
			return await removeStale(req, res)
		default:
			res.setHeader('Allow', ['POST', 'DELETE'])
			res.status(405).end('Method not allowed.')
	}
}

const post = async (req: ConnectedRequest, res: NextApiResponse) => {
	const { db } = req
	const orderDetails: CreateOrderRequest = req.body
	try {
		const booking_id = (
			await db<BookingDB>('bookings')
				.insert({
					booking_duration: `[${orderDetails.start_date.substring(
						0,
						10
					)},${orderDetails.end_date.substring(0, 10)})`,
					tub_id: orderDetails.tub_id,
				})
				.returning('booking_id')
		)[0]

		await db<OrderDB>('orders').insert({
			id: orderDetails.checkout_session_id,
			booking_id,
			paid: false,
			fulfilled: false,
			first_name: orderDetails.first_name,
			last_name: orderDetails.last_name,
			email: orderDetails.email,
			telephone_number: orderDetails.telephone_number,
			address_line_1: orderDetails.address_line_1,
			address_line_2: orderDetails.address_line_2,
			address_line_3: orderDetails.address_line_3,
			special_requests: orderDetails.special_requests,
			referee: orderDetails.referee,
			postcode: orderDetails.postcode,
		})

		res.status(200).json({ added: true })
	} catch (e) {
		res.status(400).json(e)
	}
}

const removeStale = async (req: ConnectedRequest, res: NextApiResponse) => {
	try {
		const { db } = req
		const maxAge = moment(new Date()).subtract(10, 'minutes')
		const orders: Pick<OrderDB, 'booking_id' | 'id'>[] = await db<OrderDB>(
			'orders'
		)
			.del()
			.returning(['booking_id', 'id'])
			.where('created_at', '<', maxAge.toISOString())
			.andWhere('paid', false)
		await db<BookingDB>('bookings')
			.del()
			.whereIn(
				'booking_id',
				orders.map((o) => o.booking_id)
			)

		await forEachAsync(orders, (order) => cancelPaymentIntent(order.id))

		res.status(200).send({
			received: true,
			message: {
				removed: orders,
			},
		})
	} catch (error) {
		res.status(500).send(error.message)
	}
}

const cancelPaymentIntent = async (checkoutSessionID: string) => {
	const { payment_intent } = await stripe.checkout.sessions.retrieve(
		checkoutSessionID
	)
	let id: string
	if (typeof payment_intent == 'string') {
		id = payment_intent
	} else {
		id = payment_intent.id
	}
	await stripe.paymentIntents.cancel(id, {
		cancellation_reason: 'abandoned',
	})
	console.log('Deleted', id)
}

export default db()(handler)
