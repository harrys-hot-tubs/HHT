export interface PriceRequest {
	startDate: string
	endDate: string
}

export interface PriceResponse {
	price: number
}

export interface CheckoutRequest {
	price: number
	startDate: string
	endDate: string
}
