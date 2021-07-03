import { BookingDB } from '@typings/db/Booking'
import { TubDB } from '@typings/db/Tub'

export interface OrderDB {
	id: string
	booking_id: BookingDB['booking_id']
	payment_intent_id?: string
	paid: boolean
	fulfilled: boolean
	returned: boolean
	first_name: string
	last_name: string
	email: string
	telephone_number: string
	address_line_1: string
	address_line_2: string
	address_line_3: string
	special_requests: string
	postcode: string
	referee: string
	created_at: string
}

export type PopulatedOrder = OrderDB & BookingDB & TubDB
