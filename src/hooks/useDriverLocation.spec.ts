import { locations } from '@fixtures/locationFixtures'
import useDriverLocation from '@hooks/useDriverLocation'
import SWRWrapper from '@test/helpers/SWRWrapper'
import { renderHook } from '@testing-library/react-hooks'
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import { cache } from 'swr'
import { LocationDB } from '../typings/db/Location'

const mock = new MockAdapter(axios)
const successValue: Pick<LocationDB, 'name' | 'location_id'> = {
	name: locations[0].name,
	location_id: locations[0].location_id,
}

afterEach(() => {
	mock.reset()
	mock.resetHandlers()
	cache.clear()
})

it('indicates loading before receiving data', async () => {
	mock.onGet('/api/accounts').replyOnce(200, successValue)
	const { result, waitForNextUpdate } = renderHook(useDriverLocation, {
		wrapper: SWRWrapper,
	})

	expect(result.current.isLoading).toBe(true)
	await waitForNextUpdate()
})

it('stops indicating loading after receiving data', async () => {
	mock.onGet('/api/accounts').replyOnce(200, {})
	const { result, waitForNextUpdate } = renderHook(useDriverLocation, {
		wrapper: SWRWrapper,
	})

	await waitForNextUpdate()
	expect(result.current.isLoading).toBe(false)
})

it('responds with an error when request fails', async () => {
	const error = { message: 'failed' }
	mock.onGet('/api/accounts').replyOnce(400, error)
	const { result, waitForNextUpdate } = renderHook(useDriverLocation, {
		wrapper: SWRWrapper,
	})

	await waitForNextUpdate()
	expect(result.current.isLoading).toBe(false)
	expect(
		result.current.isError || Object.keys(result.current.location).length === 0
	).toBeTruthy()
})

it('responds with data when request succeeds', async () => {
	mock.onGet('/api/accounts').replyOnce(200, successValue)
	const { result, waitForNextUpdate } = renderHook(useDriverLocation, {
		wrapper: SWRWrapper,
	})

	await waitForNextUpdate()
	expect(result.current.isLoading).toBe(false)
	expect(result.current.location).toEqual(successValue)
})
