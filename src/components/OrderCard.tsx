import { PopulatedOrder } from '@typings/db/Order'
import { extractBookingEnd, extractBookingStart, isToday } from '@utils/date'
import React from 'react'

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
}: PopulatedOrder) => {
	const orderStart = extractBookingStart(booking_duration)

	return (
		<div
			className={`order-card ${isToday(orderStart) ? 'today' : 'upcoming'}`}
			data-testid={id}
			aria-label={`information relating to order ${id}`}
		>
			<h5 data-testid='full_name'>{first_name + ' ' + last_name}</h5>
			<hr className='order-card-divider' />
			{address({ address_line_1, address_line_2, address_line_3, postcode })}
			{/* <td data-testid='telephone_number'>{telephone_number}</td>
			<td>{special_requests}</td> */}
			<hr className='order-card-divider' />
			<small className='text-muted'>
				Delivery {extractBookingStart(booking_duration).toLocaleDateString()}{' '}
				<br />
				Pickup {extractBookingEnd(booking_duration).toLocaleDateString()}
			</small>
		</div>
	)
}

const address = ({
	address_line_1,
	address_line_2,
	address_line_3,
	postcode,
}: {
	address_line_1: string
	address_line_2: string
	address_line_3: string
	postcode: string
}) => {
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

export default OrderCard
