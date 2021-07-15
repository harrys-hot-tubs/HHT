import { TubDB } from '@typings/db/Tub'
import Stripe from 'stripe'

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

export interface UpdatePaymentRequest {
	paymentIntentID: Stripe.PaymentIntent['payment_intent_id']
	promoCode: string
}
