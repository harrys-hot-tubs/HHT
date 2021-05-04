import { mixedSizes } from '@fixtures/tubsFixtures'
import { BookingDB } from '@typings/db/Booking'

export const generateStartDate = (): string => {
	const bookingStart = new Date('2302-09-19')
	bookingStart.setDate(bookingStart.getDate() + 1) // Day after tomorrow
	return bookingStart.toISOString().substr(0, 10)
}

export const generateEndDate = (): string => {
	const bookingEnd = new Date(generateStartDate())
	bookingEnd.setDate(bookingEnd.getDate() + 3) // Four days from now
	return bookingEnd.toISOString().substr(0, 10)
}

const generateDuration = (): string => {
	return `[${generateStartDate()},${generateEndDate()})`
}

export const bookings: BookingDB[] = [
	{
		booking_id: 1,
		tub_id: mixedSizes[0].tub_id,
		booking_duration: generateDuration(),
	},
]
