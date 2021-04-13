import OrderCard from '@components/OrderCard'
import useDriverLocation from '@hooks/useDriverLocation'
import useOrders from '@hooks/useOrders'
import { PopulatedOrder } from '@typings/db/Order'
import { extractBookingStart } from '@utils/date'
import React from 'react'

const DriverDashboard = () => {
	const {
		location,
		isLoading: locationIsLoading,
		isError,
	} = useDriverLocation()
	const { orders, isLoading: ordersAreLoading } = useOrders()
	const relevantOrders = findRelevant(orders, location?.location_id)

	if (locationIsLoading || ordersAreLoading) return <h1>Loading...</h1>

	return (
		<div className='outer driver'>
			<main>
				<h1>Upcoming Deliveries in {location.name}</h1>
				<div className='orders'>
					{relevantOrders.map((order) => (
						<OrderCard key={order.id} {...{ ...order }} />
					))}
				</div>
			</main>
		</div>
	)
}

const findRelevant = (orders: PopulatedOrder[], locationID: number) => {
	if (!orders || !locationID) return []

	const today = new Date()
	return orders
		.filter((order) => order.location_id === locationID)
		.filter((order) => {
			return extractBookingStart(order.booking_duration) >= today
		})
		.sort(
			(a, b) =>
				extractBookingStart(a.booking_duration).getTime() -
				extractBookingStart(b.booking_duration).getTime()
		)
}

export default DriverDashboard
