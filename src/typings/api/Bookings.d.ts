import { BookingDB } from '@typings/db/Booking'
import { TubDB } from '@typings/db/Tub'

export interface CreateBookingRequest {
	startDate: string
	endDate: string
	tubID: TubDB['tub_id']
	/**
	 * In how many minutes the booking reservation should expire.
	 */
	expiryTime: number
}

export type BookingError = 'DATE_OVERLAP' | string

export type CreateBookingResponse = CreateBookingSuccess | CreateBookingFailure

export interface CreateBookingSuccess {
	error: false
	bookingID: BookingDB['booking_id']
	exp: number
}

export interface CreateBookingFailure {
	error: true
	message: BookingError
}
