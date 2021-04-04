import { ConnectedRequest } from '@typings/api/Request'
import { LocationDB } from '@typings/db/Location'
import { OrderDB } from '@typings/db/Order'
import { TubDB } from '@typings/db/Tub'
import db from '@utils/db'
import { priceToString } from '@utils/stripe'
import Cors from 'cors'
import { Knex } from 'knex'
import { buffer } from 'micro'
import { NextApiRequest, NextApiResponse } from 'next'
import mj from 'node-mailjet'
import { Stripe } from 'stripe'

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
	methods: ['POST', 'HEAD'],
})

const runMiddleware = (
	req: NextApiRequest,
	res: NextApiResponse,
	fn: Function
) => {
	return new Promise((resolve, reject) => {
		fn(req, res, (result) => {
			if (result instanceof Error) {
				return reject(result)
			}

			return resolve(result)
		})
	})
}

async function handler(req: ConnectedRequest, res: NextApiResponse) {
	await runMiddleware(req, res, cors)
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
		return res.status(400).json({ error: `Webhook Error: ${err.message}` })
	}

	console.log('Success: ', event.id)

	if (event.type === 'payment_intent.succeeded') {
		try {
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

			await sendEmailNotification(order, db, paymentIntent)
			res.status(200).json({
				received: true,
				message: {
					id: order.id,
					payment_intent_id: order.payment_intent_id,
					paid: order.paid,
				},
			})
			return
		} catch (err) {
			console.log(err.message)
			return res.status(200).json({ received: true, error: err.message })
		}
	} else {
		return res.status(200).json({ received: true })
	}
}

const getCheckoutSessionID = async (paymentIntentID: string) => {
	const checkoutSession = await stripe.checkout.sessions.list({
		payment_intent: paymentIntentID,
	})

	if (!checkoutSession?.data[0]?.id)
		throw new Error('Missing checkoutSession id.')
	return checkoutSession.data[0].id
}

const sendEmailNotification = async (
	order: OrderDB,
	db: Knex,
	paymentIntent: Stripe.PaymentIntent,
	success: boolean = true
) => {
	try {
		const { name, booking_duration, tub_id } = await db<LocationDB>('locations')
			.join('tubs', 'tubs.location_id', 'locations.location_id')
			.join('bookings', 'bookings.tub_id', 'tubs.tub_id')
			.join('orders', 'orders.booking_id', 'bookings.booking_id')
			.where('orders.id', order.id)
			.select('locations.name', 'bookings.booking_duration', 'tubs.tub_id')
			.first()

		const tub = await db<TubDB>('tubs').where('tub_id', tub_id).first()
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
					Subject: `Online Booking`,
					htmlPart: emailTemplate(
						order,
						paymentIntent,
						name,
						booking_duration,
						tub,
						success
					),
				},
			],
		})
	} catch (e) {
		console.log('e', e)
	}
}

const emailTemplate = (
	order: OrderDB,
	paymentIntent: Stripe.PaymentIntent,
	name: string,
	booking_duration: string,
	tub: TubDB,
	success: boolean,
	origin: string = 'Stripe'
) => `<h1>Payment ${success ? 'Succeeded' : 'Failed'}.</h1>
	<p>£${priceToString(paymentIntent.amount)} paid via ${origin}</p>
	<section>
		<h2>Delivery Information</h2>
		<p>${order.address_line_1}</p>
		<p>${order.address_line_2}</p>
		<p>${order.address_line_3}</p>
		<p>${order.postcode}</p>
		<p>Order duration: ${formatDuration(booking_duration)}</p>
	</section>
	<section>
		<h2>Customer Information</h2>
		<p>Name: ${order.first_name} ${order.last_name}</p>
		<p>Contact Number: ${order.telephone_number}</p>
		<p>Special Requests: ${order.special_requests}</p>
		<p>Referee: ${order.referee}</p>
	</section>
	<section>
		<h2>Inventory Information</h2>
		<p>To be delivered from: ${name}</p>
		<p>Hot tub id: ${tub.tub_id}</p>
		<p>Hot tub capacity: ${tub.max_capacity}</p>
	</section> `

const formatDuration = (duration: string) => {
	return `${duration.slice(1, 11)} to ${duration.slice(12, -1)}`
}

export default db()(handler)
