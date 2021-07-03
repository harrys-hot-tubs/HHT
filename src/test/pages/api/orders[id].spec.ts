import { driverAccount } from '@fixtures/accountFixtures'
import { inDateAccountToken } from '@fixtures/authFixtures'
import { bookings } from '@fixtures/bookingFixtures'
import { locations } from '@fixtures/locationFixtures'
import { storedOrder } from '@fixtures/orderFixtures'
import { storedStaff } from '@fixtures/staffFixtures'
import { tubs } from '@fixtures/tubFixtures'
import { cleanupDatabase, connection } from '@helpers/DBHelper'
import handler from '@pages/api/orders/[id]'
import { ConnectedRequest } from '@typings/api'
import { AccountDB } from '@typings/db/Account'
import { BookingDB } from '@typings/db/Booking'
import { FulfilmentDB } from '@typings/db/Fulfilment'
import { LocationDB } from '@typings/db/Location'
import { OrderDB } from '@typings/db/Order'
import { StaffDB } from '@typings/db/Staff'
import { TubDB } from '@typings/db/Tub'
import { NextApiResponse } from 'next'
import { createMocks } from 'node-mocks-http'

beforeAll(async () => {
	await connection<LocationDB>('locations').insert(locations)
	await connection<TubDB>('tubs').insert(tubs)
	await connection<BookingDB>('bookings').insert(bookings[0])
	await connection<OrderDB>('orders').insert(storedOrder)
	await connection<AccountDB>('accounts').insert(driverAccount)
	await connection<StaffDB>('staff').insert(storedStaff)
})

beforeEach(async () => {
	await connection<FulfilmentDB>('fulfilments').del()
	await connection<OrderDB>('orders').del()
	await connection<OrderDB[]>('orders').insert([storedOrder])
})

it('fails for an unauthorised user', async () => {
	// TODO finish this test
})

it('sets orders as fulfilled', async () => {
	const { req, res } = createMocks<ConnectedRequest, NextApiResponse>({
		method: 'POST',
		query: { id: storedOrder.id },
		cookies: {
			token: inDateAccountToken(driverAccount),
		},
		body: { returned: false, fulfilled: true },
	})

	await handler(req, res)
	expect(res._getStatusCode()).toBe(200)
	expect(JSON.parse(res._getData())).toEqual({
		updated: {
			...storedOrder,
			returned: false,
			fulfilled: true,
			payment_intent_id: null,
		},
	})
})

it('sets orders as returned', async () => {
	const { req, res } = createMocks<ConnectedRequest, NextApiResponse>({
		method: 'POST',
		query: { id: storedOrder.id },
		cookies: {
			token: inDateAccountToken(driverAccount),
		},
		body: { returned: true, fulfilled: true },
	})

	await handler(req, res)
	expect(res._getStatusCode()).toBe(200)
	expect(JSON.parse(res._getData())).toEqual({
		updated: {
			...storedOrder,
			returned: true,
			fulfilled: true,
			payment_intent_id: null,
		},
	})
})

it('sets orders as unreturned and unfulfilled', async () => {
	const { req, res } = createMocks<ConnectedRequest, NextApiResponse>({
		method: 'POST',
		query: { id: storedOrder.id },
		cookies: {
			token: inDateAccountToken(driverAccount),
		},
		body: { returned: false, fulfilled: false },
	})

	await handler(req, res)
	expect(res._getStatusCode()).toBe(200)
	expect(JSON.parse(res._getData())).toEqual({
		updated: {
			...storedOrder,
			returned: false,
			fulfilled: false,
			payment_intent_id: null,
		},
	})
})

it("adds a change event when a order's state is changed", async () => {
	const { req, res } = createMocks<ConnectedRequest, NextApiResponse>({
		method: 'POST',
		query: { id: storedOrder.id },
		cookies: {
			token: inDateAccountToken(driverAccount),
		},
		body: { returned: true, fulfilled: true },
	})

	await handler(req, res)
	expect(res._getStatusCode()).toBe(200)

	const statusUpdates = await connection<FulfilmentDB>('fulfilments').select()

	expect(statusUpdates).toEqual(
		expect.arrayContaining([
			expect.objectContaining<Partial<FulfilmentDB>>({
				account_id: driverAccount.account_id,
				order_id: storedOrder.id,
				status: 'returned',
			}),
		])
	)
})

afterAll(async () => {
	await cleanupDatabase(connection)
})
