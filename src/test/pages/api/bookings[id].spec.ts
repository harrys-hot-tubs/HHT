import { bookings } from '@fixtures/bookingFixtures'
import { locations } from '@fixtures/locationFixtures'
import { tubs } from '@fixtures/tubFixtures'
import { cleanupDatabase, connection } from '@helpers/DBHelper'
import handler from '@pages/api/bookings/[id]'
import { ConnectedRequest } from '@typings/api'
import { BookingDB } from '@typings/db/Booking'
import { LocationDB } from '@typings/db/Location'
import { TubDB } from '@typings/db/Tub'
import { NextApiResponse } from 'next'
import { createMocks } from 'node-mocks-http'

beforeAll(async () => {
	await connection<LocationDB>('locations').insert(locations)
	await connection<TubDB>('tubs').insert(tubs)
	await connection<BookingDB>('bookings').insert([
		{
			...bookings[0],
			reserved: true,
		},
		{
			...bookings[0],
			booking_duration: '[2020-07-08,2020-07-12)',
			booking_id: 2,
		},
	])
})

describe('delete', () => {
	it('deletes reserved bookings', async () => {
		const { req, res } = createMocks<ConnectedRequest, NextApiResponse>({
			method: 'DELETE',
			query: { id: bookings[0].booking_id },
		})

		await handler(req, res)
		expect(res._getStatusCode()).toBe(200)
		expect(JSON.parse(res._getData())).toEqual({
			removed: [bookings[0].booking_id],
		})
	})

	it('does not delete unreserved bookings', async () => {
		const { req, res } = createMocks<ConnectedRequest, NextApiResponse>({
			method: 'DELETE',
			query: { id: 2 },
		})

		await handler(req, res)
		expect(res._getStatusCode()).toBe(200)
		expect(JSON.parse(res._getData())).toEqual({
			removed: [],
		})
	})
})

afterAll(async () => {
	await cleanupDatabase(connection)
})
