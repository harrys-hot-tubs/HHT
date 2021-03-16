import handler from '@pages/api/tubs/[id]'
import { LOCATIONS } from '@test/fixtures/locationFixtures'
import { MIXED_SIZES } from '@test/fixtures/tubsFixtures'
import { cleanupDatabase, connection } from '@test/helpers/DBHelper'
import { PriceResponse } from '@typings/api/Checkout'
import { ConnectedRequest } from '@typings/api/Request'
import { LocationDB } from '@typings/Location'
import { TubDB } from '@typings/Tub'
import { NextApiResponse } from 'next'
import { createMocks } from 'node-mocks-http'

beforeAll(async () => {
	await connection<LocationDB>('locations').insert(LOCATIONS)
	await connection<TubDB>('tubs').insert(MIXED_SIZES)
})

describe('get', () => {
	it('returns correct tub', async () => {
		const { req, res } = createMocks({
			method: 'GET',
			query: {
				id: MIXED_SIZES[0].tub_id,
			},
		})

		await handler(req, res)
		expect(res._getStatusCode()).toBe(200)
		expect(JSON.parse(res._getData())).toEqual(MIXED_SIZES[0])
	})

	it('fails to return non-existent tub', async () => {
		const { req, res } = createMocks({
			method: 'GET',
			query: {
				id: -1,
			},
		})

		await handler(req, res)
		expect(res._getStatusCode()).toBe(400)
	})
})

describe('post', () => {
	it('correctly calculates the initial price of an existing hot tub', async () => {
		const { req, res } = createMocks<
			ConnectedRequest,
			NextApiResponse<PriceResponse>
		>({
			method: 'POST',
			query: {
				id: MIXED_SIZES[0].tub_id,
			},
			body: { startDate: '2021-03-01', endDate: '2021-03-03' },
		})

		await handler(req, res)
		expect(res._getStatusCode()).toBe(200)
		expect(JSON.parse(res._getData())).toEqual(
			expect.objectContaining({
				price: 109,
			})
		)
	})

	it('correctly calculates an extended price of an existing hot tub', async () => {
		const { req, res } = createMocks<
			ConnectedRequest,
			NextApiResponse<PriceResponse>
		>({
			method: 'POST',
			query: {
				id: MIXED_SIZES[0].tub_id,
			},
			body: { startDate: '2021-03-01', endDate: '2021-03-04' },
		})

		await handler(req, res)
		expect(res._getStatusCode()).toBe(200)
		expect(JSON.parse(res._getData())).toEqual(
			expect.objectContaining({
				price: 109 + 20,
			})
		)
	})

	it('fails to return price of a non-existent document', async () => {
		const { req, res } = createMocks<
			ConnectedRequest,
			NextApiResponse<PriceResponse>
		>({
			method: 'POST',
			query: {
				id: -1,
			},
			body: { startDate: '2021-03-01', endDate: '2021-03-04' },
		})

		await handler(req, res)
		expect(res._getStatusCode()).toBe(400)
	})
})

afterAll(async () => {
	await cleanupDatabase(connection)
})
