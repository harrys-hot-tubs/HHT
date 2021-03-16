import { ConnectedRequest } from '@typings/api/Request'
import { BookingDB } from '@typings/Booking'
import db from '@utils/db'
import { NextApiResponse } from 'next'

async function handler(req: ConnectedRequest, res: NextApiResponse) {
	switch (req.method) {
		case 'GET':
			return await get(req, res)
		default:
			res.setHeader('Allow', 'GET')
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
	} catch (e) {
		return res.status(400).json(e)
	}
}

export default db()(handler)
