import { TubDB } from '@typings/db/Tub'

export interface BookingDB {
	booking_id: number
	tub_id: TubDB['tub_id']
	booking_duration: string
	reserved: boolean
	reservation_end: string
}
