import { birmingham } from '@fixtures/postcodeFixtures'
import { CheckoutInformation } from '@hooks/useCheckoutInformation'
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

export const formData = {
	startDate: '2000-01-05',
	endDate: '2000-01-09',
	postcode: birmingham,
}

export const validCheckoutInformation: CheckoutInformation = {
	firstName: 'John',
	lastName: 'Doe',
	email: 'john@doe.com',
	telephoneNumber: '0800 2229 911',
	addressLine1: '4 Privet Drive',
	addressLine2: 'Little Whinging',
	addressLine3: 'Surrey',
	referee: 'Instagram',
	specialRequests: 'None',
}
