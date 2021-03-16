import handler from '@pages/api/bookings'
import { BOOKINGS } from '@test/fixtures/bookingFixtures'
import { LOCATIONS } from '@test/fixtures/locationFixtures'
import { MIXED_SIZES } from '@test/fixtures/tubsFixtures'
import { cleanupDatabase, connection } from '@test/helpers/DBHelper'
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
	it('returns all existing bookings', async () => {
		const { req, res } = createMocks<
			ConnectedRequest,
			NextApiResponse<BookingDB[]>
		>({
			method: 'GET',
		})
		await handler(req, res)
		expect(res._getStatusCode()).toBe(200)
		expect(JSON.parse(res._getData())).toEqual(BOOKINGS)
	})
})

afterAll(async () => {
	await cleanupDatabase(connection)
})
