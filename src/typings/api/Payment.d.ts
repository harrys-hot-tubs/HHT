import { TubDB } from '@typings/db/Tub'

export interface PriceRequest {
	startDate: string
	endDate: string
}

export interface PriceResponse {
	price: number
}

export interface PaymentIntentRequest {
	tubID: TubDB['tub_id']
	startDate: string
	endDate: string
}
