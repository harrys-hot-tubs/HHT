import { ConnectedRequest } from '@typings/api'
import {
	CreateBookingRequest,
	CreateBookingResponse,
} from '@typings/api/Bookings'
import { BookingDB } from '@typings/db/Booking'
import db from '@utils/db'
import { addMinutes } from 'date-fns'
import { NextApiResponse } from 'next'

async function handler(req: ConnectedRequest, res: NextApiResponse) {
	switch (req.method) {
		case 'GET':
			return get(req, res)
		case 'POST':
			return post(req, res)
		case 'DELETE':
			return removeStale(req, res)
		default:
			res.setHeader('Allow', ['GET', 'POST', 'DELETE'])
			res.status(405).end('Method not allowed.')
	}
}

const get = async (
	req: ConnectedRequest,
	res: NextApiResponse<BookingDB[]>
) => {
	try {
		const { db } = req
		const bookings = await db<BookingDB>('bookings').select()
		return res.status(200).json(bookings)
	} catch (error) {
		console.error(error.message)
		return res.status(400).json(error)
	}
}

const post = async (
	req: ConnectedRequest<CreateBookingRequest>,
	res: NextApiResponse<CreateBookingResponse>
) => {
	try {
		const { db, body } = req
		const now = new Date()

		const booking_id = (
			await db<BookingDB>('bookings')
				.insert({
					booking_duration: `[${body.startDate.substring(
						0,
						10
					)},${body.endDate.substring(0, 10)})`,
					tub_id: body.tubID,
					reserved: true,
					reservation_end: addMinutes(now, body.expiryTime).toISOString(),
				})
				.returning('booking_id')
		)[0]

		return res.status(200).json({
			bookingID: booking_id,
			error: false,
			exp: addMinutes(now, body.expiryTime).getTime(),
		})
	} catch (error) {
		console.error(error?.message)
		if (error?.constraint === 'overlapping_durations')
			return res.status(400).json({
				error: true,
				message: 'DATE_OVERLAP',
			})

		return res.status(500).json({
			error: true,
			message: error?.message,
		})
	}
}

const removeStale = async (req: ConnectedRequest, res: NextApiResponse) => {
	try {
		const { db } = req
		const removed = await db<BookingDB>('bookings')
			.del()
			.where('reservation_end', '<', new Date().toISOString())
			.andWhere('reserved', '=', true)
			.returning('booking_id')

		return res.status(200).json({
			removed,
		})
	} catch (error) {
		console.error(error.message)
		return res.status(500).json({ error: error.message })
	}
}

export default db()(handler)
