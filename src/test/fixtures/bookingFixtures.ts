import { mixedSizes } from '@fixtures/tubsFixtures'
import { BookingDB } from '@typings/Booking'

export const bookings: BookingDB[] = [
	{
		booking_id: 1,
		tub_id: mixedSizes[0].tub_id,
		booking_duration: '[2021-03-05,2021-03-08)',
	},
]
