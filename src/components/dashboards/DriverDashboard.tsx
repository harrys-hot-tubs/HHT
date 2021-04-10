import OrderRow from '@components/OrderRow'
import useLocation from '@hooks/useLocation'
import useOrders from '@hooks/useOrders'
import { PopulatedOrder } from '@typings/db/Order'
import React from 'react'

interface ComponentProps {
	/**
	 * ID of the account belonging to the driver this dashboard is being displayed for.
	 */
	id: number
}

const DriverDashboard = ({ id }: ComponentProps) => {
	const { location, isLoading: locationIsLoading, isError } = useLocation()
	const { orders, isLoading: ordersAreLoading } = useOrders()
	const relevantOrders = findRelevant(orders, location.location_id)

	if (locationIsLoading) return <h1>Loading...</h1>

	return (
		<div>
			<h1>Upcoming Deliveries in {location.name}</h1>
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
					{relevantOrders.map((order) => (
						<OrderRow key={order.id} {...{ ...order }} />
					))}
				</tbody>
			</table>
		</div>
	)
}

const findRelevant = (orders: PopulatedOrder[], locationID: number) => {
	if (!orders || !locationID) return []

	return orders.filter((order) => order.location_id === locationID)
}

export default DriverDashboard
