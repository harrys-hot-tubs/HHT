import { NextApiRequest, NextApiResponse } from 'next'
import {
	AvailabilityRequest,
	AvailabilityResponse,
} from '../../typings/api/Availability'
import { BookingDB } from '../../typings/Booking'
import { TubDB } from '../../typings/Tub'
import db from '../../utils/db'

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	switch (req.method) {
		case 'POST':
			return await post(req, res)
	}
}

const post = async (
	req: NextApiRequest,
	res: NextApiResponse<AvailabilityResponse>
) => {
	const tubs = await findAvailableTubs(req.body)
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

const findAvailableTubs = async ({
	closest,
	startDate,
	endDate,
}: AvailabilityRequest): Promise<TubDB[]> => {
	return await db<TubDB>('tubs')
		.select()
		.whereNotIn('tub_id', function () {
			this.select('tub_id')
				.from<BookingDB>('bookings')
				.where('booking_duration', '&&', `[${startDate},${endDate})`)
		})
		.andWhere('location_id', '=', closest)
}
