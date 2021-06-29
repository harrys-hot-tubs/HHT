import { bookings } from '@fixtures/bookingFixtures'
import { bir, esb } from '@fixtures/coordinateFixtures'
import { locations } from '@fixtures/locationFixtures'
import { tubs } from '@fixtures/tubFixtures'
import { cleanupDatabase, connection } from '@helpers/DBHelper'
import handler from '@pages/api/locations'
import { ConnectedRequest } from '@typings/api'
import { RangeResponse } from '@typings/api/Locations'
import { BookingDB } from '@typings/db/Booking'
import { LocationDB } from '@typings/db/Location'
import { TubDB } from '@typings/db/Tub'
import { NextApiResponse } from 'next'
import { createMocks } from 'node-mocks-http'

beforeAll(async () => {
	await connection<LocationDB>('locations').insert(locations)
	await connection<TubDB>('tubs').insert(tubs)
	await connection<BookingDB>('bookings').insert(bookings)
})

describe('get', () => {
	it('returns all locations', async () => {
		const { req, res } = createMocks<
			ConnectedRequest,
			NextApiResponse<LocationDB[]>
		>({
			method: 'GET',
		})
		await handler(req, res)
		expect(res._getStatusCode()).toBe(200)
		expect(JSON.parse(res._getData())).toEqual(locations)
	})
})

describe('post', () => {
	it('detects locations in range', async () => {
		const { req, res } = createMocks<
			ConnectedRequest,
			NextApiResponse<RangeResponse[]>
		>({
			method: 'POST',
			body: { latitude: bir.latitude, longitude: bir.longitude },
		})
		await handler(req, res)
		expect(res._getStatusCode()).toBe(200)
		expect(JSON.parse(res._getData())).toEqual(
			expect.objectContaining({
				inRange: true,
			})
		)
	})

	it('detects locations out of range', async () => {
		const { req, res } = createMocks<
			ConnectedRequest,
			NextApiResponse<RangeResponse[]>
		>({
			method: 'POST',
			body: { latitude: esb.latitude, longitude: esb.longitude },
		})

		await handler(req, res)
		expect(res._getStatusCode()).toBe(200)
		expect(JSON.parse(res._getData())).toEqual(
			expect.objectContaining({
				inRange: false,
			})
		)
	})
})

afterAll(async () => {
	await cleanupDatabase(connection)
})
