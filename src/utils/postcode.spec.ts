import { BIR, ESB } from '@test/fixtures/coordinateFixtures'
import {
	BATH,
	BIRMINGHAM,
	CENTRAL_LONDON,
	CHESTER,
	DURHAM,
	EDINBURGH,
	FailedRangeResponse,
	LIVERPOOL,
	NEWCASTLE,
	SHEFFIELD,
	SuccessfulRangeResponse,
} from '@test/fixtures/postcodeFixtures'
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
		isPostcode(CHESTER).then((res) => expect(res[0]).toBeTruthy())
		isPostcode(LIVERPOOL).then((res) => expect(res[0]).toBeTruthy())
		isPostcode(SHEFFIELD).then((res) => expect(res[0]).toBeTruthy())
		isPostcode(BIRMINGHAM).then((res) => expect(res[0]).toBeTruthy())
		isPostcode(CENTRAL_LONDON).then((res) => expect(res[0]).toBeTruthy())
		isPostcode(NEWCASTLE).then((res) => expect(res[0]).toBeTruthy())
		isPostcode(DURHAM).then((res) => expect(res[0]).toBeTruthy())
		isPostcode(BATH).then((res) => expect(res[0]).toBeTruthy())
		isPostcode(EDINBURGH).then((res) => expect(res[0]).toBeTruthy())
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
	})
})

describe('getCoordinates', () => {
	beforeAll(() => {
		mock.onAny().passThrough()
	})

	it('determines latitude and longitude of a valid postcode', () => {
		getCoordinates(BATH).then((res) => {
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
		mock.onPost('/api/locations').reply(200, SuccessfulRangeResponse)

		const received = await getInRange(BIR)
		expect(received).toEqual([true, null])
	})

	it('responds with correct response if the postcode is not in range', async () => {
		mock.onPost('/api/locations').reply(200, FailedRangeResponse)

		const received = await getInRange(ESB)
		expect(received[0]).toBe(false)
		expect(received[1]).toBeDefined()
	})
})

describe('getClosestDispatcher', () => {
	beforeAll(() => {
		mock.onGet().passThrough()
	})

	it('responds with closest location if postcode is in range', async () => {
		mock.onPost('/api/locations').reply(200, SuccessfulRangeResponse)

		const received = await getClosestDispatcher(BIRMINGHAM)
		expect(received).toBe(SuccessfulRangeResponse.closest.location_id)
	})

	it('throws error if the postcode is not in range', async () => {
		mock.onPost('/api/locations').reply(200, FailedRangeResponse)

		expect(getClosestDispatcher(EDINBURGH)).rejects.toThrow()
	})
})

afterAll(() => {
	mock.restore()
})
