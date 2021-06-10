import { PopulatedOrder } from '@typings/db/Order'
import { extractBookingStart } from '@utils/date'
import React from 'react'

interface ComponentProps {
	orders: PopulatedOrder[]
}

const UpcomingOrders = ({ orders }: ComponentProps) => {
	const upcoming = findUpcoming(orders)
	return (
		<div>
			<h2>Upcoming Orders</h2>
			<p>View the next 10 upcoming orders.</p>
			{upcoming.length > 0 ? (
				upcoming.slice(0, 10).map((order) => (
					<div key={order.id} className='card upcoming'>
						<h5>
							{order.first_name} {order.last_name}
						</h5>
						<small>
							Starting{' '}
							<span data-testid='order-date'>
								{extractBookingStart(
									order.booking_duration
								).toLocaleDateString()}
							</span>
						</small>
					</div>
				))
			) : (
				<h5>The are no upcoming orders.</h5>
			)}
		</div>
	)
}

export default UpcomingOrders

/**
 * Finds all orders that are to be delivered today or in the future, sorted by date - soonest first.
 * @param orders All orders in the database.
 * @returns All orders that are to be delivered either today, or in the future.
 */
const findUpcoming = (orders: PopulatedOrder[]): PopulatedOrder[] => {
	if (!orders) return []

	const today = new Date()
	return orders
		.filter((order) => {
			return extractBookingStart(order.booking_duration) >= today
		})
		.sort(
			(a, b) =>
				extractBookingStart(a.booking_duration).getTime() -
				extractBookingStart(b.booking_duration).getTime()
		)
}
