import { locations } from '@fixtures/locationFixtures'
import { mixedSizes } from '@fixtures/tubsFixtures'
import handler from '@pages/api/tubs'
import { cleanupDatabase, connection } from '@test/helpers/DBHelper'
import { ConnectedRequest } from '@typings/api/Request'
import { LocationDB } from '@typings/Location'
import { TubDB } from '@typings/Tub'
import { NextApiResponse } from 'next'
import { createMocks } from 'node-mocks-http'

beforeAll(async () => {
	await connection<LocationDB>('locations').insert(locations)
	await connection<TubDB>('tubs').insert(mixedSizes)
})

describe('get', () => {
	it('returns all existing tubs', async () => {
		const { req, res } = createMocks<
			ConnectedRequest,
			NextApiResponse<TubDB[]>
		>({
			method: 'GET',
		})
		await handler(req, res)
		expect(res._getStatusCode()).toBe(200)
		expect(JSON.parse(res._getData())).toEqual(mixedSizes)
	})
})

afterAll(async () => {
	await cleanupDatabase(connection)
})
