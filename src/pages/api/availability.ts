import {
	AvailabilityRequest,
	AvailabilityResponse,
} from '@typings/api/Availability'
import { ConnectedRequest } from '@typings/api/Request'
import { BookingDB } from '@typings/Booking'
import { TubDB } from '@typings/Tub'
import db from '@utils/db'
import { Knex } from 'knex'
import { NextApiResponse } from 'next'

async function handler(req: ConnectedRequest, res: NextApiResponse) {
	switch (req.method) {
		case 'POST':
			return await post(req, res)
		default:
			res.setHeader('Allow', 'POST')
			res.status(405).end('Method not allowed.')
	}
}

const post = async (
	req: ConnectedRequest,
	res: NextApiResponse<AvailabilityResponse>
) => {
	const tubs = await findAvailableTubs(req.body, req.db)
	if (tubs.length > 0) {
		return res.status(200).json({
			available: true,
			tubs,
		})
	} else {
		return res.status(200).json({
			available: false,
		})
	}
}

const findAvailableTubs = async (
	{ closest, startDate, endDate }: AvailabilityRequest,
	db: Knex
): Promise<TubDB[]> => {
	return await db<TubDB>('tubs')
		.select()
		.whereNotIn('tub_id', function () {
			this.select('tub_id')
				.from<BookingDB>('bookings')
				.where('booking_duration', '&&', `[${startDate},${endDate})`)
		})
		.andWhere('location_id', '=', closest)
}

export default db()(handler)
