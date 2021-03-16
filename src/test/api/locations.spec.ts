import handler from '@pages/api/locations'
import { BOOKINGS } from '@test/fixtures/bookingFixtures'
import { BIR, ESB } from '@test/fixtures/coordinateFixtures'
import { LOCATIONS } from '@test/fixtures/locationFixtures'
import { MIXED_SIZES } from '@test/fixtures/tubsFixtures'
import { cleanupDatabase, connection } from '@test/helpers/DBHelper'
import { RangeResponse } from '@typings/api/Locations'
import { ConnectedRequest } from '@typings/api/Request'
import { BookingDB } from '@typings/Booking'
import { LocationDB } from '@typings/Location'
import { TubDB } from '@typings/Tub'
import { NextApiResponse } from 'next'
import { createMocks } from 'node-mocks-http'

beforeAll(async () => {
	await connection<LocationDB>('locations').insert(LOCATIONS)
	await connection<TubDB>('tubs').insert(MIXED_SIZES)
	await connection<BookingDB>('bookings').insert(BOOKINGS)
})

describe('get', () => {
	it('detects locations in range', async () => {
		const { req, res } = createMocks<
			ConnectedRequest,
			NextApiResponse<RangeResponse[]>
		>({
			method: 'POST',
			body: { latitude: BIR.latitude, longitude: BIR.longitude },
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
			body: { latitude: ESB.latitude, longitude: ESB.longitude },
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

afterAll(async (done) => {
	await cleanupDatabase(connection)
	done()
})
