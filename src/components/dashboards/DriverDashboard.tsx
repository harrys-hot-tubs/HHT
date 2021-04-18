import DriverLists from '@components/DriverLists'
import useDriverLocation from '@hooks/useDriverLocation'
import useOrders from '@hooks/useOrders'
import { PopulatedOrder } from '@typings/db/Order'
import React from 'react'
import DatePicker from 'react-datepicker'
import useStoredState from '../../hooks/useStoredState'

const DriverDashboard = () => {
	const { location, isLoading: locationIsLoading } = useDriverLocation()
	const { orders, isLoading: ordersAreLoading } = useOrders()
	const [minDate, setMinDate] = useStoredState<Date>({
		fallback: new Date(),
		fromString: (v) => new Date(v),
		toString: (v) => v.toISOString(),
		key: 'minDate',
	})
	const [maxDate, setMaxDate] = useStoredState<Date>({
		fallback: new Date(),
		fromString: (v) => new Date(v),
		toString: (v) => v.toISOString(),
		key: 'maxDate',
	})
	const relevant = findRelevant(orders, location?.location_id)

	if (locationIsLoading || ordersAreLoading) return <h1>Loading...</h1>
	// TODO fix css
	return (
		<div className='outer driver'>
			<main>
				<h1>Orders in {location.name}</h1>
				<span className='order-restriction'>
					Showing orders from{' '}
					<DatePicker
						selected={minDate}
						onChange={(date: Date) => setMinDate(date)}
						maxDate={maxDate}
						todayButton='Today'
						className='inline-picker'
					/>{' '}
					to{' '}
					<DatePicker
						selected={maxDate}
						onChange={(date: Date) => setMaxDate(date)}
						minDate={minDate}
						todayButton='Today'
						className='inline-picker'
					/>
					.
				</span>
				<DriverLists orders={relevant} maxDate={maxDate} minDate={minDate} />
			</main>
		</div>
	)
}

const findRelevant = (orders: PopulatedOrder[], locationID: number) => {
	if (!orders || !locationID) return []

	return orders.filter(({ location_id }) => location_id === locationID)
}

export default DriverDashboard
