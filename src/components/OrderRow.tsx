import { PopulatedOrder } from '@typings/db/Order'
import { extractBookingStart, isToday } from '@utils/date'
import React from 'react'

/**
 * Displays all information relevant to a particular order.
 */
const OrderRow = ({
	id,
	booking_id,
	payment_intent_id,
	paid,
	fulfilled,
	first_name,
	last_name,
	email,
	booking_duration,
}: PopulatedOrder) => {
	const orderStart = extractBookingStart(booking_duration)

	return (
		<tr
			className={isToday(orderStart) ? 'today' : 'upcoming'}
			data-testid={id}
			aria-label={`information relating to order ${id}`}
		>
			<td data-testid='booking_id'>{booking_id}</td>
			<td data-testid='payment_intent_id'>
				{payment_intent_id !== undefined ? payment_intent_id : 'Missing'}
			</td>
			<td data-testid='paid'>
				{paid !== undefined ? paid.toString() : 'Unknown'}
			</td>
			<td data-testid='fulfilled'>
				{fulfilled !== undefined ? paid.toString() : 'Unknown'}
			</td>
			<td data-testid='full_name'>{first_name + ' ' + last_name}</td>
			<td data-testid='email_address'>{email}</td>
			<td data-testid='booking_start'>
				{extractBookingStart(booking_duration).toLocaleDateString()}
			</td>
		</tr>
	)
}

export default OrderRow
