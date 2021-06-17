import { birmingham } from '@fixtures/postcodeFixtures'
import { tubs, zeroPrice } from '@fixtures/tubFixtures'
import { CheckoutInformation } from '@hooks/useCheckoutInformation'
import { PaymentIntentRequest } from '@typings/api/Payment'

export const validPaymentIntentRequest: PaymentIntentRequest = {
	tubID: tubs[0].tub_id,
	startDate: '2017-01-01',
	endDate: '2017-01-03',
}

export const invalidPaymentIntentRequestZeroTime: PaymentIntentRequest = {
	tubID: tubs[0].tub_id,
	startDate: '2017-01-01',
	endDate: '2017-01-01',
}

export const invalidPaymentIntentRequestNegativeTime: PaymentIntentRequest = {
	tubID: tubs[0].tub_id,
	startDate: '2017-01-01',
	endDate: '2016-01-01',
}

export const invalidPaymentIntentRequestZeroPrice: PaymentIntentRequest = {
	tubID: zeroPrice.tub_id,
	startDate: '2017-01-01',
	endDate: '2017-01-03',
}

export const invalidPaymentIntentRequestTubID: PaymentIntentRequest = {
	tubID: 45893,
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
