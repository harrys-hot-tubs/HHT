import useFulfilments from '@hooks/useFulfilments'
import useLocations from '@hooks/useLocations'
import { LocationDB } from '@typings/db/Location'
import { PopulatedOrder } from '@typings/db/Order'
import React, { useEffect, useState } from 'react'
import { Card } from 'react-bootstrap'
import { Typeahead } from 'react-bootstrap-typeahead'

interface ComponentProps {
	orders: PopulatedOrder[]
}

const RecentlyFulfilled = ({ orders }: ComponentProps) => {
	const { fulfilments, isLoading: fulfilmentsLoading } = useFulfilments()
	const { locations, isLoading: locationsLoading } = useLocations()
	const [selected, setSelected] = useState<LocationDB[]>([])
	const [filtered, setFiltered] = useState([])

	useEffect(() => {
		const date = new Date()
		date.setDate(date.getDate() - 7)
		setFiltered(
			orders.filter(
				(order) =>
					selected.some(
						(selected) => selected.location_id === order.location_id
					) &&
					fulfilments.some(
						(fulfilment) =>
							fulfilment.order_id === order.id &&
							fulfilment.status !== 'undelivered' &&
							new Date(fulfilment.created_at) > date
					)
			)
		)
	}, [selected, orders])

	return (
		<div>
			<h2>Recent Changes</h2>
			<p>
				View the most recent changes to every order changed in the last week.
			</p>
			<Typeahead
				isLoading={locationsLoading || fulfilmentsLoading}
				id='location-selector'
				multiple
				labelKey={(location: LocationDB) => location.name}
				options={locationsLoading ? ([] as LocationDB[]) : locations}
				onChange={(selected) => {
					setSelected(selected)
				}}
				selected={selected}
			/>
			<div className='recently-fulfilled'>
				{filtered.length > 0 ? (
					filtered.map((order) => (
						<div key={order.id} className='card'>
							<Card.Title>
								{order.first_name} {order.last_name}
							</Card.Title>
							<Card.Body>
								Last changed at{' '}
								{new Date(
									fulfilments.filter(
										(fulfilment) => fulfilment.order_id === order.id
									)[0].created_at
								).toLocaleString()}{' '}
								to{' '}
								{
									fulfilments.filter(
										(fulfilment) => fulfilment.order_id === order.id
									)[0].status
								}
								.
							</Card.Body>
						</div>
					))
				) : (
					<h5>Nothing to show here.</h5>
				)}
			</div>
		</div>
	)
}

export default RecentlyFulfilled
