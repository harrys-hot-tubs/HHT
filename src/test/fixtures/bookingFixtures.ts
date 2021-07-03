import { tubs } from '@fixtures/tubFixtures'
import { BookingDB } from '@typings/db/Booking'
import { addDays } from 'date-fns'

export const generateStartDate = (): string => {
	return addDays(new Date('2302-09-19'), 1).toISOString().substr(0, 10)
}

export const generateEndDate = (): string =>
	addDays(new Date(generateStartDate()), 3).toISOString().substr(0, 10)

const generateDuration = (): string => {
	return `[${generateStartDate()},${generateEndDate()})`
}

export const bookings: BookingDB[] = [
	{
		booking_id: 1,
		tub_id: tubs[0].tub_id,
		booking_duration: generateDuration(),
		reserved: false,
		reservation_end: '2029-02-07T00:00:00.000Z',
	},
]
