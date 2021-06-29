import { ConnectedRequest } from '@typings/api'
import {
	AvailabilityRequest,
	AvailabilityResponse,
} from '@typings/api/Availability'
import { BookingDB } from '@typings/db/Booking'
import { TubDB } from '@typings/db/Tub'
import db from '@utils/db'
import { Knex } from 'knex'
import { NextApiResponse } from 'next'

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
	req: ConnectedRequest<AvailabilityRequest>,
	res: NextApiResponse<AvailabilityResponse>
) => {
	const { db, body } = req

	const tubs = await findAvailableTubs(body, db)
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

/**
 * Determines which hot tubs are available based on the conditions provided.
 * @param db Knex instance.
 * @returns An array of hot tubs that are available subject to the provided conditions.
 */
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
		.andWhere('available', '=', true)
}

export default db()(handler)
