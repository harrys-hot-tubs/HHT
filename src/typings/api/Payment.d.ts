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

export type UpdatePaymentRequestType = keyof Stripe.PaymentIntent

export type UpdatePaymentRequest = ApplyPromoCodeRequest | CashOnDeliveryRequest
export interface ApplyPromoCodeRequest {
	type: 'PROMO_CODE'
	paymentIntentID: Stripe.PaymentIntent['payment_intent_id']
	promoCode: string
}

export interface CashOnDeliveryRequest {
	type: 'CASH_ON_DELIVERY'
	paymentIntentID: Stripe.PaymentIntent['payment_intent_id']
	cashOnDelivery: boolean
}
