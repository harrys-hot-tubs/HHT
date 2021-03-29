import { bookings } from '@fixtures/bookingFixtures'
import { locations } from '@fixtures/locationFixtures'
import { orderRequest, storedOrder } from '@fixtures/orderFixtures'
import { mixedSizes } from '@fixtures/tubsFixtures'
import handler from '@pages/api/orders'
import { cleanupDatabase, connection } from '@test/helpers/DBHelper'
import { OrderDB } from '@typings/api/Order'
import { ConnectedRequest } from '@typings/api/Request'
import { BookingDB } from '@typings/Booking'
import { LocationDB } from '@typings/Location'
import { TubDB } from '@typings/Tub'
import { NextApiResponse } from 'next'
import { createMocks } from 'node-mocks-http'

beforeAll(async () => {
	await connection<LocationDB>('locations').insert(locations)
	await connection<TubDB>('tubs').insert(mixedSizes)
})

describe('post', () => {
	it('adds an order', async () => {
		const { req, res } = createMocks<ConnectedRequest, NextApiResponse>({
			method: 'POST',
			body: orderRequest,
		})
		await handler(req, res)
		expect(res._getStatusCode()).toBe(200)
		expect(JSON.parse(res._getData())).toEqual({ added: true })
	})
})

describe('delete', () => {
	it('deletes outdated orders', async () => {
		await connection<OrderDB[]>('orders').del()
		await connection<BookingDB[]>('bookings').del()
		await connection<BookingDB[]>('bookings').insert([bookings[0]])
		await connection<OrderDB[]>('orders').insert([storedOrder])
		const { req, res } = createMocks<ConnectedRequest, NextApiResponse>({
			method: 'DELETE',
		})
		await handler(req, res)
		expect(res._getStatusCode()).toBe(500)

		const storedBookings = await connection<BookingDB[]>('bookings').select()
		expect(storedBookings.length).toBe(0)
		const storedOrders = await connection<OrderDB[]>('orders').select()
		expect(storedOrders.length).toBe(0)
	})

	it("doesn't delete in date orders", async () => {
		await connection<OrderDB[]>('orders').del()
		await connection<BookingDB[]>('bookings').del()
		await connection<BookingDB[]>('bookings').insert([bookings[0]])
		await connection<OrderDB[]>('orders').insert([
			{ ...storedOrder, created_at: '3000-03-08 10:59:59' },
		])
		const { req, res } = createMocks<ConnectedRequest, NextApiResponse>({
			method: 'DELETE',
		})
		await handler(req, res)
		expect(res._getStatusCode()).toBe(200)

		const storedBookings = await connection<BookingDB[]>('bookings').select()
		expect(storedBookings.length).toBe(1)
		const storedOrders = await connection<OrderDB[]>('orders').select()
		expect(storedOrders.length).toBe(1)
	})
})

afterAll(async () => {
	await cleanupDatabase(connection)
})