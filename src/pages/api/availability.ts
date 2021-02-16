import moment from 'moment'
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

const get = async (req: NextApiRequest, res: NextApiResponse<string[]>) => {
	try {
		const { id } = req.body
		const bookings = await db<BookingDB>('bookings')
			.select()
			.where('tubID', '=', id)
		const unavailableDates = findUnavailabilities(bookings)
		return res.status(200).json(unavailableDates)
	} catch (e) {
		return res.status(400).json(e)
	}
}

const findUnavailabilities = (bookings: BookingDB[]): string[] => {
	const unavailableDates: string[] = []
	bookings.forEach((booking) => {
		const dates = enumerateDates(booking.startDate, booking.endDate)
		unavailableDates.push(...dates)
	})
	return unavailableDates
}

const enumerateDates = (start: string, end: string): string[] => {
	let startDate = moment(start)
	const endDate = moment(end)
	const dates: string[] = []
	while (!startDate.isAfter(endDate, 'D')) {
		dates.push(startDate.toISOString())
		startDate = moment(startDate).add(1, 'days')
	}
	return dates
}
