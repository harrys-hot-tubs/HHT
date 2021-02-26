import { OrderDB } from '@typings/api/Order'
import { ConnectedRequest } from '@typings/api/Request'
import { BookingDB } from '@typings/Booking'
import db from '@utils/db'
import Knex from 'knex'
import { buffer } from 'micro'
import Cors from 'micro-cors'
import { NextApiResponse } from 'next'
import mj from 'node-mailjet'
import { Stripe } from 'stripe'
import { LocationDB } from '../../typings/Location'

const stripe: Stripe = new Stripe(process.env.STRIPE_SECRET, {
	apiVersion: '2020-08-27',
})

const mailjet = mj.connect(process.env.MJ_PUBLIC, process.env.MJ_SECRET)

export const config = {
	api: {
		bodyParser: false,
	},
}

const cors = Cors({
	allowMethods: ['POST', 'HEAD'],
})

async function handler(req: ConnectedRequest, res: NextApiResponse) {
	switch (req.method) {
		case 'POST':
			return await post(req, res)
		default:
			res.setHeader('Allow', 'POST')
			res.status(405).end('Method not allowed.')
	}
}

const post = async (req: ConnectedRequest, res: NextApiResponse) => {
	const { db } = req
	const buf = await buffer(req)
	const sig = req.headers['stripe-signature']!

	let event: Stripe.Event

	try {
		event = stripe.webhooks.constructEvent(
			buf.toString(),
			sig,
			process.env.WEBHOOK_SECRET
		)
	} catch (err) {
		console.log(err.message)
		res.status(400).send(`Webhook Error: ${err.message}`)
		return
	}

	console.log('Success: ', event.id)

	if (event.type === 'payment_intent.succeeded') {
		const paymentIntent = event.data.object as Stripe.PaymentIntent
		const sessionID = await getCheckoutSessionID(paymentIntent.id)
		const order = (
			await db<OrderDB>('orders')
				.update({
					payment_intent_id: paymentIntent.id,
					paid: true,
				})
				.where('id', sessionID)
				.returning('*')
		)[0]

		await sendEmailNotification(order, db)
		console.log('completion')
	} else if (event.type === 'payment_intent.payment_failed') {
		const paymentIntent = event.data.object as Stripe.PaymentIntent
		const sessionID = await getCheckoutSessionID(paymentIntent.id)
		const booking_id = (
			await db<OrderDB>('orders')
				.del()
				.where('id', sessionID)
				.returning('booking_id')
		)[0]
		await db<BookingDB>('bookings').del().where('booking_id', booking_id)
		console.log('deletion')
	}

	res.status(200).json({ received: true })
}

const getCheckoutSessionID = async (paymentIntentID: string) => {
	const checkoutSession = await stripe.checkout.sessions.list({
		payment_intent: paymentIntentID,
	})
	return checkoutSession.data[0].id
}

const sendEmailNotification = async (
	order: OrderDB,
	db: Knex,
	success: boolean = true
) => {
	try {
		const { name: locationName } = await db<LocationDB>('locations')
			.select('name')
			.join('tubs', 'tubs.location_id', 'locations.location_id')
			.join('bookings', 'bookings.tub_id', 'tubs.tub_id')
			.join('orders', 'orders.booking_id', 'bookings.booking_id')
			.where('orders.id', order.id)
			.first()
		console.log('locationName', locationName)

		await mailjet.post('send', { version: 'v3.1' }).request({
			Messages: [
				{
					From: {
						Email: 'bridges.wood@gmail.com',
						Name: 'Max Wood',
					},
					To: [
						{
							Email: 'bridges.wood@gmail.com',
							Name: 'Max Wood',
						},
						{
							Email: 'harry@harryshottubs.com',
							Name: 'Harry Strudwick',
						},
					],
					Subject: `Order ${order.id}`,
					TextPart: `
						Payment ${success ? 'succeeded' : 'failed'}.
						Customer: ${order.first_name} ${order.last_name}
						Address:
							${order.address_line_1}
							${order.address_line_2}
							${order.address_line_3}
							${order.postcode}
						Contact number:
							${order.telephone_number}
						Special requests:
							${order.special_requests}
						To be delivered from:
							${locationName}
					`,
				},
			],
		})
	} catch (e) {
		console.log('e', e)
	}
}

export default db()(handler)
