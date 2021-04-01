import { bir, esb } from '@fixtures/coordinateFixtures'
import {
	bath,
	birmingham,
	centralLondon,
	chester,
	durham,
	edinburgh,
	failedRangeResponse,
	liverpool,
	newcastle,
	sheffield,
	successfulRangeResponse,
} from '@fixtures/postcodeFixtures'
import {
	getClosestDispatcher,
	getCoordinates,
	getInRange,
	isPostcode,
} from '@utils/postcode'
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'

const mock = new MockAdapter(axios)

describe('isPostcode', () => {
	beforeAll(() => {
		mock.onAny().passThrough()
	})

	it('identifies valid postcodes', () => {
		isPostcode(chester).then((res) => expect(res[0]).toBeTruthy())
		isPostcode(liverpool).then((res) => expect(res[0]).toBeTruthy())
		isPostcode(sheffield).then((res) => expect(res[0]).toBeTruthy())
		isPostcode(birmingham).then((res) => expect(res[0]).toBeTruthy())
		isPostcode(centralLondon).then((res) => expect(res[0]).toBeTruthy())
		isPostcode(newcastle).then((res) => expect(res[0]).toBeTruthy())
		isPostcode(durham).then((res) => expect(res[0]).toBeTruthy())
		isPostcode(bath).then((res) => expect(res[0]).toBeTruthy())
		isPostcode(edinburgh).then((res) => expect(res[0]).toBeTruthy())
	})

	it('identifies invalid postcodes', () => {
		isPostcode('AS1 1AH').then((res) => {
			expect(res[0]).toBeFalsy()
			expect(res[1]).toBeTruthy()
		})

		isPostcode('').then((res) => {
			expect(res[0]).toBeFalsy()
			expect(res[1]).toBeTruthy()
		})

		isPostcode(null).then((res) => {
			expect(res[0]).toBeFalsy()
			expect(res[1]).toBeTruthy()
		})

		isPostcode(undefined).then((res) => {
			expect(res[0]).toBeFalsy()
			expect(res[1]).toBeTruthy()
		})
	})
})

describe('getCoordinates', () => {
	beforeAll(() => {
		mock.onAny().passThrough()
	})

	it('determines latitude and longitude of a valid postcode', () => {
		getCoordinates(bath).then((res) => {
			expect(res.latitude).toBe(51.379324)
			expect(res.longitude).toBe(-2.327157)
		})
	})
})

describe('getInRange', () => {
	beforeAll(() => {
		mock.reset()
	})

	it('responds with correct response if the postcode is in range', async () => {
		mock.onPost('/api/locations').reply(200, successfulRangeResponse)
		await expect(getInRange(bir)).resolves.toEqual([true, null])
	})

	it('responds with correct response if the postcode is not in range', async () => {
		mock.onPost('/api/locations').reply(200, failedRangeResponse)

		const received = await getInRange(esb)
		expect(received[0]).toBe(false)
		expect(received[1]).toBeDefined()
	})
})

describe('getClosestDispatcher', () => {
	beforeAll(() => {
		mock.onGet().passThrough()
	})

	it('responds with closest location if postcode is in range', async () => {
		mock.onPost('/api/locations').reply(200, successfulRangeResponse)

		await expect(getClosestDispatcher(birmingham)).resolves.toBe(
			successfulRangeResponse.closest.location_id
		)
	})

	it('throws error if the postcode is not in range', async () => {
		mock.onPost('/api/locations').reply(200, failedRangeResponse)

		await expect(getClosestDispatcher(edinburgh)).rejects.toThrow()
	})
})

afterAll(() => {
	mock.restore()
})
