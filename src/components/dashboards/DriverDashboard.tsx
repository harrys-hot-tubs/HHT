import DriverLists from '@components/DriverLists'
import LogoutButton from '@components/LogoutButton'
import useDateRange from '@hooks/useDateRange'
import useDriverLocation from '@hooks/useDriverLocation'
import useOrders from '@hooks/useOrders'
import { PopulatedOrder } from '@typings/db/Order'
import React from 'react'
import DatePicker from 'react-datepicker'

const DriverDashboard = () => {
	const {
		location,
		isLoading: locationIsLoading,
		isError: locationError,
	} = useDriverLocation()
	const {
		orders,
		isLoading: ordersAreLoading,
		isError: ordersError,
	} = useOrders()
	const { rangeStart, rangeEnd, setRangeStart, setRangeEnd } = useDateRange({
		startKey: 'minDate',
		endKey: 'maxDate',
		swap: true,
	})
	const relevant = findRelevant(orders, location?.location_id)

	if (locationIsLoading || ordersAreLoading) return <h1>Loading...</h1>
	if (locationError || ordersError) return <h1>Error</h1>
	return (
		<div className='outer driver'>
			<main>
				<h1>Orders in {location.name}</h1>
				<span className='order-restriction'>
					Showing orders from{' '}
					<DatePicker
						selected={rangeStart}
						startDate={rangeStart}
						endDate={rangeEnd}
						selectsStart
						onChange={(date: Date) => setRangeStart(date)}
						maxDate={rangeEnd}
						todayButton='Today'
						className='inline-picker'
						id='start'
						dateFormat='dd/MM/yyyy'
					/>{' '}
					to{' '}
					<DatePicker
						selected={rangeEnd}
						startDate={rangeStart}
						endDate={rangeEnd}
						selectsEnd
						onChange={(date: Date) => setRangeEnd(date)}
						minDate={rangeStart}
						todayButton='Today'
						className='inline-picker'
						id='end'
						dateFormat='dd/MM/yyyy'
					/>
					.
				</span>
				<DriverLists
					orders={relevant}
					maxDate={rangeEnd}
					minDate={rangeStart}
				/>
			</main>
			<LogoutButton />
		</div>
	)
}

const findRelevant = (orders: PopulatedOrder[], locationID: number) => {
	if (!orders || !locationID) return []

	return orders.filter(({ location_id }) => location_id === locationID)
}

export default DriverDashboard
