import handler from '@pages/api/tubs'
import { LOCATIONS } from '@test/fixtures/locationFixtures'
import { MIXED_SIZES } from '@test/fixtures/tubsFixtures'
import { cleanupDatabase, connection } from '@test/helpers/DBHelper'
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
	it('returns all existing tubs', async () => {
		const { req, res } = createMocks<
			ConnectedRequest,
			NextApiResponse<TubDB[]>
		>({
			method: 'GET',
		})
		await handler(req, res)
		expect(res._getStatusCode()).toBe(200)
		expect(JSON.parse(res._getData())).toEqual(MIXED_SIZES)
	})
})

afterAll(async () => {
	await cleanupDatabase(connection)
})
