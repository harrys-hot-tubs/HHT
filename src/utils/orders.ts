import { PopulatedOrder } from '@typings/db/Order'
import { extractBookingEnd, extractBookingStart } from '@utils/date'

export const upcomingDeliveries = (
	orders: PopulatedOrder[],
	maxDate: Date,
	minDate: Date
): PopulatedOrder[] => {
	return orders.filter(({ booking_duration, fulfilled, returned }) => {
		const deliveryDate = extractBookingStart(booking_duration)
		return (
			deliveryDate >= minDate &&
			deliveryDate <= maxDate &&
			!returned &&
			!fulfilled
		)
	})
}

export const upcomingPickups = (
	orders: PopulatedOrder[],
	maxDate: Date,
	minDate: Date
): PopulatedOrder[] => {
	return orders.filter(({ booking_duration, fulfilled, returned }) => {
		const pickupDate = extractBookingEnd(booking_duration)
		return (
			pickupDate >= minDate && pickupDate <= maxDate && !returned && fulfilled
		)
	})
}

export const completed = (orders: PopulatedOrder[]): PopulatedOrder[] =>
	orders.filter(({ returned, fulfilled }) => fulfilled && returned)

export const sortByDate = (
	orders: PopulatedOrder[],
	date: 'start' | 'end'
): PopulatedOrder[] =>
	orders.sort((a, b) => {
		if (date === 'start')
			return (
				extractBookingStart(a.booking_duration).getTime() -
				extractBookingEnd(b.booking_duration).getTime()
			)
		if (date === 'end')
			return (
				extractBookingEnd(a.booking_duration).getTime() -
				extractBookingEnd(b.booking_duration).getTime()
			)
	})
