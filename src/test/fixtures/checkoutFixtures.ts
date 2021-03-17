import { CheckoutRequest } from '@typings/api/Checkout'

export const validCheckoutRequest: CheckoutRequest = {
	price: 109,
	startDate: '2017-01-01',
	endDate: '2017-01-03',
}

export const invalidCheckoutRequestZeroTime: CheckoutRequest = {
	price: 109,
	startDate: '2017-01-01',
	endDate: '2017-01-01',
}

export const invalidCheckoutRequestNegativeTime: CheckoutRequest = {
	price: 109,
	startDate: '2017-01-01',
	endDate: '2016-01-01',
}

export const invalidCheckoutRequestPrice: CheckoutRequest = {
	price: 0,
	startDate: '2017-01-01',
	endDate: '2017-01-03',
}
