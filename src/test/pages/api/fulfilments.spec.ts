import { driverAccount } from '@fixtures/accountFixtures'
import { bookings } from '@fixtures/bookingFixtures'
import { fulfilments } from '@fixtures/fulfilmentFixtures'
import { locations } from '@fixtures/locationFixtures'
import { storedOrder } from '@fixtures/orderFixtures'
import { mixedSizes } from '@fixtures/tubFixtures'
import { cleanupDatabase, connection } from '@helpers/DBHelper'
import handler from '@pages/api/fulfilments'
import { ConnectedRequest } from '@typings/api/Request'
import { AccountDB } from '@typings/db/Account'
import { BookingDB } from '@typings/db/Booking'
import { FulfilmentDB } from '@typings/db/Fulfilment'
import { LocationDB } from '@typings/db/Location'
import { OrderDB } from '@typings/db/Order'
import { TubDB } from '@typings/db/Tub'
import { NextApiResponse } from 'next'
import { createMocks } from 'node-mocks-http'

beforeAll(async () => {
	await connection<AccountDB[]>('accounts').insert([driverAccount])
	await connection<LocationDB[]>('locations').insert(locations)
	await connection<TubDB[]>('tubs').insert(mixedSizes)
	await connection<BookingDB[]>('bookings').insert(bookings)
	await connection<OrderDB[]>('orders').insert([storedOrder])
	await connection<FulfilmentDB[]>('fulfilments').insert(fulfilments)
})

describe('get', () => {
	it('fetches the latest fulfilment for each order', async () => {
		const { req, res } = createMocks<
			ConnectedRequest,
			NextApiResponse<FulfilmentDB[]>
		>({
			method: 'GET',
		})
		await handler(req, res)
		expect(res._getStatusCode()).toBe(200)
		expect(JSON.parse(res._getData())).toEqual<FulfilmentDB[]>(
			expect.arrayContaining([
				expect.objectContaining<Partial<FulfilmentDB>>({
					fulfilment_id: fulfilments[1].fulfilment_id,
					account_id: fulfilments[1].account_id,
					order_id: fulfilments[1].order_id,
					status: fulfilments[1].status,
				}),
			])
		)
	})
})

afterAll(async () => {
	await cleanupDatabase(connection)
})
