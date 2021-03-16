import { bookings } from '@fixtures/bookingFixtures'
import { bir, esb } from '@fixtures/coordinateFixtures'
import { locations } from '@fixtures/locationFixtures'
import { mixedSizes } from '@fixtures/tubsFixtures'
import handler from '@pages/api/locations'
import { cleanupDatabase, connection } from '@test/helpers/DBHelper'
import { RangeResponse } from '@typings/api/Locations'
import { ConnectedRequest } from '@typings/api/Request'
import { BookingDB } from '@typings/Booking'
import { LocationDB } from '@typings/Location'
import { TubDB } from '@typings/Tub'
import { NextApiResponse } from 'next'
import { createMocks } from 'node-mocks-http'

beforeAll(async () => {
	await connection<LocationDB>('locations').insert(locations)
	await connection<TubDB>('tubs').insert(mixedSizes)
	await connection<BookingDB>('bookings').insert(bookings)
})

describe('get', () => {
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
