import { PopulatedOrder } from '@typings/db/Order'
import { extractBookingEnd, extractBookingStart } from '@utils/date'
import React, { useState } from 'react'
import { Draggable } from 'react-beautiful-dnd'

export type OrderState = 'pickup' | 'dropoff'

const OrderCard = ({
	id,
	first_name,
	last_name,
	telephone_number,
	address_line_1,
	address_line_2,
	address_line_3,
	postcode,
	special_requests,
	booking_duration,
	state,
	index,
}: PopulatedOrder & {
	state?: OrderState
	index: number
}) => {
	const [showDetails, setShowDetails] = useState(false)
	const isUrgent = () => {
		const today = new Date()
		if (state === 'dropoff')
			return extractBookingStart(booking_duration) <= today
		if (state === 'pickup') return extractBookingEnd(booking_duration) <= today
	}

	return (
		<Draggable draggableId={id} index={index}>
			{(provided) => (
				<div
					className={`order-card ${isUrgent() ? 'today' : 'upcoming'}`}
					data-testid={id}
					aria-label={`information relating to order ${id}`}
					ref={provided.innerRef}
					{...provided.draggableProps}
					{...provided.dragHandleProps}
					onClick={() => {
						setShowDetails(!showDetails)
					}}
				>
					<h5 data-testid='full_name' style={{ marginBottom: 0 }}>
						{first_name + ' ' + last_name}
					</h5>
					<hr className='order-card-divider' />
					<small className='text-muted'>
						{dates({ booking_duration, state })}
					</small>
					{showDetails ? (
						<>
							<hr className='order-card-divider' />
							{address({
								address_line_1,
								address_line_2,
								address_line_3,
								postcode,
							})}
						</>
					) : null}
				</div>
			)}
		</Draggable>
	)
}

const address = ({
	address_line_1,
	address_line_2,
	address_line_3,
	postcode,
}: Pick<
	PopulatedOrder,
	'address_line_1' | 'address_line_2' | 'address_line_3' | 'postcode'
>) => {
	return (
		<div className='order-address'>
			{address_line_1 !== null ? (
				<>
					{address_line_1}
					<br />
				</>
			) : null}
			{address_line_2 !== null ? (
				<>
					{address_line_2}
					<br />
				</>
			) : null}
			{address_line_3 !== null ? (
				<>
					{address_line_3}
					<br />
				</>
			) : null}
			{postcode}
		</div>
	)
}

const dates = ({
	booking_duration,
	state,
}: Pick<PopulatedOrder, 'booking_duration'> & { state: OrderState }) => {
	switch (state) {
		case 'dropoff':
			return (
				<>
					Delivery {extractBookingStart(booking_duration).toLocaleDateString()}
				</>
			)
		case 'pickup':
			return (
				<>Pickup {extractBookingEnd(booking_duration).toLocaleDateString()}</>
			)
		default:
			return (
				<>
					Delivery {extractBookingStart(booking_duration).toLocaleDateString()}
					<br />
					Pickup {extractBookingEnd(booking_duration).toLocaleDateString()}
				</>
			)
	}
}

export default OrderCard
