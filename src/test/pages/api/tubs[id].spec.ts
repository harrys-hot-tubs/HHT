import { locations } from '@fixtures/locationFixtures'
import { mixedSizes } from '@fixtures/tubsFixtures'
import { cleanupDatabase, connection } from '@helpers/DBHelper'
import handler from '@pages/api/tubs/[id]'
import { PriceResponse } from '@typings/api/Checkout'
import { ConnectedRequest } from '@typings/api/Request'
import { LocationDB } from '@typings/db/Location'
import { TubDB } from '@typings/db/Tub'
import { NextApiResponse } from 'next'
import { createMocks } from 'node-mocks-http'

beforeAll(async () => {
	await connection<LocationDB>('locations').insert(locations)
	await connection<TubDB>('tubs').insert(mixedSizes)
})

describe('get', () => {
	it('returns correct tub', async () => {
		const { req, res } = createMocks({
			method: 'GET',
			query: {
				id: mixedSizes[0].tub_id,
			},
		})

		await handler(req, res)
		expect(res._getStatusCode()).toBe(200)
		expect(JSON.parse(res._getData())).toEqual(mixedSizes[0])
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
	}, 7000)
})

describe('post', () => {
	it('correctly calculates the initial price of an existing hot tub', async () => {
		const { req, res } = createMocks<
			ConnectedRequest,
			NextApiResponse<PriceResponse>
		>({
			method: 'POST',
			query: {
				id: mixedSizes[0].tub_id,
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
				id: mixedSizes[0].tub_id,
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
