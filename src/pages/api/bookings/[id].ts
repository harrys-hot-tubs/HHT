import { ConnectedRequest } from '@typings/api/Request'
import { BookingDB } from '@typings/db/Booking'
import db from '@utils/db'
import { NextApiResponse } from 'next'

async function handler(req: ConnectedRequest, res: NextApiResponse) {
	switch (req.method) {
		case 'DELETE':
			return await remove(req, res)
		default:
			res.setHeader('Allow', ['DELETE'])
			res.status(405).end('Method not allowed.')
	}
}

const remove = async (req: ConnectedRequest, res: NextApiResponse) => {
	try {
		const {
			db,
			query: { id },
		} = req
		const removed = await db<BookingDB>('bookings')
			.del()
			.where('booking_id', '=', id)
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
