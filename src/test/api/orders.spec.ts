import { BOOKINGS } from '@test/fixtures/bookingFixtures'
import { LOCATIONS } from '@test/fixtures/locationFixtures'
import { MIXED_SIZES } from '@test/fixtures/tubsFixtures'
import { cleanupDatabase, connection } from '@test/helpers/DBHelper'
import { BookingDB } from '@typings/Booking'
import { LocationDB } from '@typings/Location'
import { TubDB } from '@typings/Tub'

beforeAll(async () => {
	await connection<LocationDB>('locations').insert(LOCATIONS)
	await connection<TubDB>('tubs').insert(MIXED_SIZES)
	await connection<BookingDB>('bookings').insert(BOOKINGS)
})

describe('post', () => {
	it('returns all existing bookings', async () => {
		// const { req, res } = createMocks<
		// 	ConnectedRequest,
		// 	NextApiResponse<BookingDB[]>
		// >({
		// 	method: 'GET',
		// })
		// await handler(req, res)
		// expect(res._getStatusCode()).toBe(200)
		// expect(JSON.parse(res._getData())).toEqual(MIXED_SIZES)
	})
})

describe('delete', () => {})

afterAll(async () => {
	await cleanupDatabase(connection)
})
