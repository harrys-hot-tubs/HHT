import { mixedSizes } from '@fixtures/tubsFixtures'
import { BookingDB } from '@typings/db/Booking'

const generateDuration = (): string => {
	const bookingStart = new Date()
	bookingStart.setDate(bookingStart.getDate() + 1) // Day after tomorrow
	const bookingEnd = new Date(bookingStart)
	bookingEnd.setDate(bookingEnd.getDate() + 3) // Four days from now
	return `[${bookingStart
		.toISOString()
		.substr(0, 10)},${bookingEnd.toISOString().substr(0, 10)})`
}

export const bookings: BookingDB[] = [
	{
		booking_id: 1,
		tub_id: mixedSizes[0].tub_id,
		booking_duration: generateDuration(),
	},
]
