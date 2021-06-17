import { bookings } from '@fixtures/bookingFixtures'
import { CreateOrderRequest } from '@typings/api/Order'
import { OrderDB } from '@typings/db/Order'

export const orderRequest: Omit<CreateOrderRequest, 'paymentIntentID'> = {
	first_name: 'John',
	last_name: 'Doe',
	email: 'email@doe.com',
	telephone_number: '12345',
	address_line_1: '4 Privet Drive',
	address_line_2: 'Little Whinging',
	address_line_3: 'Surrey',
	special_requests: '',
	referee: 'Instagram',
	postcode: 'AB2 2CD',
	booking_id: 1,
}

export const storedOrder: OrderDB = {
	id: 'checkout_session_id',
	booking_id: bookings[0].booking_id,
	paid: false,
	fulfilled: false,
	returned: false,
	first_name: 'John',
	last_name: 'Doe',
	email: 'email@doe.com',
	telephone_number: '12345',
	address_line_1: '4 Privet Drive',
	address_line_2: 'Little Whinging',
	address_line_3: 'Surrey',
	special_requests: '',
	referee: 'Instagram',
	postcode: 'AB2 2CD',
	created_at: '2021-03-08T10:59:59.000Z',
}
