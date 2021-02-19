import { NextApiRequest, NextApiResponse } from 'next'
import { BookingDB } from '../../typings/Booking'
import db from '../../utils/db'

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	switch (req.method) {
		case 'GET':
			return await get(req, res)
	}
}

const get = async (_req: NextApiRequest, res: NextApiResponse<BookingDB[]>) => {
	try {
		const tubs = await db<BookingDB>('bookings').select()
		return res.status(200).json(tubs)
	} catch (e) {
		return res.status(400).json(e)
	}
}
