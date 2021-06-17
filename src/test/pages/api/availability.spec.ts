import {
	closedBookingRequest,
	openBookingRequest,
} from '@fixtures/availabilityFixtures'
import { bookings } from '@fixtures/bookingFixtures'
import { locations } from '@fixtures/locationFixtures'
import { tubs } from '@fixtures/tubFixtures'
import { cleanupDatabase, connection } from '@helpers/DBHelper'
import handler from '@pages/api/availability'
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

describe('post', () => {
	it('returns all tubs for expected location', async () => {
		const { req, res } = createMocks<ConnectedRequest, NextApiResponse>({
			method: 'POST',
			body: openBookingRequest,
		})
		await handler(req, res)
		expect(res._getStatusCode()).toBe(200)
		expect(JSON.parse(res._getData())).toEqual({
			available: true,
			tubs: tubs.filter((tub) => tub.location_id === locations[0].location_id),
		})
	})

	it('returns no tubs for booking clash', async () => {
		const toRemove = await connection<TubDB>('tubs')
			.select('*')
			.where('tub_id', '>', 1)
		await connection<TubDB>('tubs').del().where('tub_id', '>', 1)
		const { req, res } = createMocks<ConnectedRequest, NextApiResponse>({
			method: 'POST',
			body: closedBookingRequest,
		})
		await handler(req, res)
		expect(res._getStatusCode()).toBe(200)
		expect(JSON.parse(res._getData())).toEqual({
			available: false,
		})
		await connection<TubDB>('tubs').insert(toRemove)
	})

	it('only returns available tubs', async () => {
		await connection<TubDB>('tubs')
			.update({ available: false })
			.where('tub_id', '>', 1)

		const { req, res } = createMocks<ConnectedRequest, NextApiResponse>({
			method: 'POST',
			body: openBookingRequest,
		})
		await handler(req, res)
		expect(res._getStatusCode()).toBe(200)
		expect(JSON.parse(res._getData())).toEqual({
			available: true,
			tubs: tubs.filter((tub) => tub.tub_id <= 1),
		})

		await connection<TubDB>('tubs')
			.update({ available: true })
			.where('tub_id', '>', 1)
	})
})

afterAll(async () => {
	await cleanupDatabase(connection)
})
