import {
	bookings,
	generateEndDate,
	generateStartDate,
} from '@fixtures/bookingFixtures'
import { locations } from '@fixtures/locationFixtures'
import { tubs } from '@fixtures/tubFixtures'
import { cleanupDatabase, connection } from '@helpers/DBHelper'
import handler from '@pages/api/bookings'
import {
	CreateBookingRequest,
	CreateBookingResponse,
} from '@typings/api/Bookings'
import { ConnectedRequest } from '@typings/api/Request'
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
	it('returns all existing bookings', async () => {
		const { req, res } = createMocks<
			ConnectedRequest,
			NextApiResponse<BookingDB[]>
		>({
			method: 'GET',
		})
		await handler(req, res)
		expect(res._getStatusCode()).toBe(200)
		expect(JSON.parse(res._getData())).toEqual(bookings)
	})
})

describe('post', () => {
	beforeEach(async () => {
		await connection<BookingDB>('bookings').del()
	})

	it('adds valid bookings', async () => {
		const { req, res } = createMocks<
			ConnectedRequest,
			NextApiResponse<CreateBookingResponse>
		>({
			method: 'POST',
			body: {
				startDate: '2021-06-21',
				endDate: '2021-06-25',
				tubID: tubs[0].tub_id,
				expiryTime: 10,
			} as CreateBookingRequest,
		})

		await handler(req, res)
		expect(res._getStatusCode()).toBe(200)
		expect(JSON.parse(res._getData())).toEqual(
			expect.objectContaining<CreateBookingResponse>({
				bookingID: 1,
				error: false,
				exp: expect.any(Number),
			})
		)
	})

	it('returns an error if a booking overlaps another for the same hot tub', async () => {
		await connection<BookingDB>('bookings').insert(bookings)
		const { req, res } = createMocks<
			ConnectedRequest,
			NextApiResponse<CreateBookingResponse>
		>({
			method: 'POST',
			body: {
				startDate: generateStartDate(),
				endDate: generateEndDate(),
				tubID: bookings[0].tub_id,
				expiryTime: 10,
			} as CreateBookingRequest,
		})

		await handler(req, res)
		expect(res._getStatusCode()).toBe(400)
		expect(JSON.parse(res._getData())).toEqual(
			expect.objectContaining<CreateBookingResponse>({
				error: true,
				message: 'DATE_OVERLAP',
			})
		)
	})
})

describe('delete', () => {
	beforeEach(async () => {
		await connection<BookingDB>('bookings').insert([
			{
				tub_id: 1,
				reserved: true,
				booking_id: 2,
				reservation_end: '2017-06-01',
				booking_duration: '[2017-06-08,2017-06-14)',
			},
			{
				tub_id: 1,
				reserved: false,
				booking_id: 3,
				reservation_end: '2017-06-02',
				booking_duration: '[2017-06-15,2017-06-18)',
			},
		])
	})

	it('only deletes bookings with expired reservations that are still reserved', async () => {
		const { req, res } = createMocks<
			ConnectedRequest,
			NextApiResponse<BookingDB['booking_id'][]>
		>({
			method: 'DELETE',
		})

		await handler(req, res)
		expect(res._getStatusCode()).toBe(200)
		expect(JSON.parse(res._getData())).toEqual({
			removed: [2],
		})
	})
})

afterAll(async () => {
	await cleanupDatabase(connection)
})
