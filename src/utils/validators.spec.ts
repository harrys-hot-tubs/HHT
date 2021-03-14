import {
	BIRMINGHAM,
	FailedRangeResponse,
	SuccessfulRangeResponse,
} from '@test/fixtures/postcodeFixtures'
import {
	PostcodeError,
	validatePostcode,
	validatePromoCode,
} from '@utils/validators'
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'

const mock = new MockAdapter(axios)

describe('validatePostcode', () => {
	beforeAll(() => {
		mock.onGet().passThrough()
	})

	it('identifies valid postcodes', async () => {
		mock.onPost('/api/locations').reply(200, SuccessfulRangeResponse)

		const response = await validatePostcode(BIRMINGHAM)
		expect(response).toEqual([true, null])
	})

	it('identifies missing postcodes', async () => {
		const response = await validatePostcode(null)
		expect(response[0]).toBe(false)
		expect(response[1]).toBe<PostcodeError>('missing')
	})

	it('identifies blocked postcodes', async () => {
		const response = await validatePostcode('SE1 1AB')
		expect(response[0]).toBe(false)
		expect(response[1]).toBe<PostcodeError>('blocked')
	})

	it('identifies non existent postcodes', async () => {
		const response = await validatePostcode('M69 1OL')
		expect(response[0]).toBe(false)
		expect(response[1]).toBe<PostcodeError>('format')
	})

	it('identifies out of range postcodes', async () => {
		mock.onPost('/api/locations').reply(200, FailedRangeResponse)

		const response = await validatePostcode(BIRMINGHAM)
		expect(response[0]).toBe(false)
		expect(response[1]).toBe<PostcodeError>('range')
	})
})

describe('validatePromoCode', () => {
	it('accepts valid promo codes', () => {
		expect(validatePromoCode('FREE2020')).toEqual([true, null])
	})

	it('rejects invalid promo codes', () => {
		expect(validatePromoCode('TEST')).toEqual([false, 'invalid'])
	})
})
