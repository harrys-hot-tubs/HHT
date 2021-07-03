import { BookingDB } from '@typings/db/Booking'
export interface CreateOrderRequest {
	paymentIntentID: string
	booking_id: BookingDB['booking_id']
	first_name: string
	last_name: string
	email: string
	telephone_number: string
	address_line_1: string
	address_line_2: string
	address_line_3: string
	special_requests: string
	referee: string
	postcode: string
}

export interface DeleteOrderRequest {
	id: string
}

export interface OrderResponse {}
