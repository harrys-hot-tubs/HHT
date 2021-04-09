import OrderRow from '@components/OrderRow'
import useOrders from '@hooks/useOrders'
import { PopulatedOrder } from '@typings/db/Order'
import { extractBookingStart } from '@utils/date'
import React from 'react'

const ManagerDashboard = () => {
	const { orders, isLoading } = useOrders()
	const upcomingOrders = findUpcoming(orders)

	if (isLoading) return <h1 data-testid='loading-indicator'>Loading...</h1>

	return (
		<div>
			<h1>Upcoming Orders</h1>
			<table>
				<thead>
					<tr>
						<td>Booking ID</td>
						<td>Payment Intent ID</td>
						<td>Paid</td>
						<td>Fulfilled</td>
						<td>First Name</td>
						<td>Email</td>
					</tr>
				</thead>
				<tbody>
					{upcomingOrders.map((order) => (
						<OrderRow key={order.id} {...{ ...order }} />
					))}
				</tbody>
			</table>
		</div>
	)
}

const findUpcoming = (orders: PopulatedOrder[]) => {
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

export default ManagerDashboard
