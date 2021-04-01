import {
	birmingham,
	failedRangeResponse,
	successfulRangeResponse,
} from '@fixtures/postcodeFixtures'
import validatePostcode, {
	blockedOutcodes,
	PostcodeError,
} from '@utils/validators/postcodeValidator'
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'

const mock = new MockAdapter(axios)

beforeAll(() => {
	mock.onGet().passThrough()
})

it('identifies valid postcodes', async () => {
	mock.onPost('/api/locations').reply(200, successfulRangeResponse)

	const response = await validatePostcode(birmingham)
	expect(response).toEqual([true, null])
})

it('identifies valid lowercase postcodes', async () => {
	mock.onPost('/api/locations').reply(200, successfulRangeResponse)

	const response = await validatePostcode(birmingham.toLowerCase())
	expect(response).toEqual([true, null])
})

it('identifies null postcodes', async () => {
	const response = await validatePostcode(null)
	expect(response[0]).toBe(false)
	expect(response[1]).toBe<PostcodeError>('missing')
})

it('identifies undefined postcodes', async () => {
	const response = await validatePostcode(undefined)
	expect(response[0]).toBe(false)
	expect(response[1]).toBe<PostcodeError>('missing')
})

it('identifies empty postcodes', async () => {
	const response = await validatePostcode('')
	expect(response[0]).toBe(false)
	expect(response[1]).toBe<PostcodeError>('missing')
})

it('identifies blocked postcodes', async () => {
	const response = await validatePostcode(`${blockedOutcodes[0]}1 2AB`)
	expect(response[0]).toBe(false)
	expect(response[1]).toBe<PostcodeError>('blocked')
})

it('identifies non existent postcodes', async () => {
	const response = await validatePostcode('M69 1OL')
	expect(response[0]).toBe(false)
	expect(response[1]).toBe<PostcodeError>('format')
})

it('identifies out of range postcodes', async () => {
	mock.onPost('/api/locations').reply(200, failedRangeResponse)

	const response = await validatePostcode(birmingham)
	expect(response[0]).toBe(false)
	expect(response[1]).toBe<PostcodeError>('range')
})
