import useDriverLocation from '@hooks/useDriverLocation'
import useOrders from '@hooks/useOrders'
import { PopulatedOrder } from '@typings/db/Order'
import React from 'react'
import DriverLists from '../DriverLists'

const DriverDashboard = () => {
	const {
		location,
		isLoading: locationIsLoading,
		isError,
	} = useDriverLocation()
	const { orders, isLoading: ordersAreLoading } = useOrders()
	const relevant = findRelevant(orders, location?.location_id)

	if (locationIsLoading || ordersAreLoading) return <h1>Loading...</h1>

	return (
		<div className='outer driver'>
			<main>
				<div>
					<h1>Orders in {location.name}</h1>
					<DriverLists orders={relevant} />
				</div>
			</main>
		</div>
	)
}

const findRelevant = (orders: PopulatedOrder[], locationID: number) => {
	if (!orders || !locationID) return []

	return orders.filter(({ location_id }) => location_id === locationID)
}

export default DriverDashboard
