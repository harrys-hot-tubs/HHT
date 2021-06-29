import { driverAccount } from '@fixtures/accountFixtures'
import { bookings } from '@fixtures/bookingFixtures'
import { locations } from '@fixtures/locationFixtures'
import { storedOrder } from '@fixtures/orderFixtures'
import { refunds } from '@fixtures/refundFixtures'
import { tubs } from '@fixtures/tubFixtures'
import { cleanupDatabase, connection } from '@helpers/DBHelper'
import handler from '@pages/api/refunds'
import { ConnectedRequest } from '@typings/api'
import { AccountDB } from '@typings/db/Account'
import { BookingDB } from '@typings/db/Booking'
import { LocationDB } from '@typings/db/Location'
import { OrderDB } from '@typings/db/Order'
import { RefundDB } from '@typings/db/Refund'
import { TubDB } from '@typings/db/Tub'
import { NextApiResponse } from 'next'
import { createMocks } from 'node-mocks-http'

beforeAll(async () => {
	await connection<AccountDB[]>('accounts').insert([driverAccount])
	await connection<LocationDB[]>('locations').insert(locations)
	await connection<TubDB[]>('tubs').insert(tubs)
	await connection<BookingDB[]>('bookings').insert(bookings)
	await connection<OrderDB[]>('orders').insert([storedOrder])
	await connection<RefundDB[]>('refunds').insert(refunds)
})

describe('get', () => {
	it('returns all refunds', async () => {
		const { req, res } = createMocks<
			ConnectedRequest,
			NextApiResponse<RefundDB[]>
		>({
			method: 'GET',
		})
		await handler(req, res)
		expect(res._getStatusCode()).toBe(200)
		expect(JSON.parse(res._getData())).toEqual<RefundDB[]>(refunds)
	})
})

afterAll(async () => {
	await cleanupDatabase(connection)
})
