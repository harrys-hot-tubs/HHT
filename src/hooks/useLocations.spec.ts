import { locations } from '@fixtures/locationFixtures'
import SWRWrapper from '@helpers/SWRWrapper'
import useLocations from '@hooks/useLocations'
import { renderHook } from '@testing-library/react-hooks'
import { LocationDB } from '@typings/db/Location'
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import { cache } from 'swr'

const mock = new MockAdapter(axios)
const successValue: LocationDB[] = locations

afterEach(() => {
	mock.reset()
	mock.resetHandlers()
	cache.clear()
})

it('indicates loading before receiving data', async () => {
	mock.onGet('/api/locations').replyOnce(200, successValue)
	const { result, waitForNextUpdate } = renderHook(useLocations, {
		wrapper: SWRWrapper,
	})

	expect(result.current.isLoading).toBe(true)
	await waitForNextUpdate()
})

it('stops indicating loading after receiving data', async () => {
	mock.onGet('/api/locations').replyOnce(200, {})
	const { result, waitForNextUpdate } = renderHook(useLocations, {
		wrapper: SWRWrapper,
	})

	await waitForNextUpdate()
	expect(result.current.isLoading).toBe(false)
})

it('responds with an error when request fails', async () => {
	const error = { message: 'failed' }
	mock.onGet('/api/locations').replyOnce(400, error)

	const { result, waitForNextUpdate } = renderHook(useLocations, {
		wrapper: SWRWrapper,
	})

	await waitForNextUpdate()
	expect(result.current.isLoading).toBe(false)
	expect(
		result.current.isError || Object.keys(result.current.locations).length === 0
	).toBeTruthy()
})

it('responds with data when request succeeds', async () => {
	mock.onGet('/api/locations').replyOnce(200, successValue)
	const { result, waitForNextUpdate } = renderHook(useLocations, {
		wrapper: SWRWrapper,
	})

	await waitForNextUpdate()
	expect(result.current.isLoading).toBe(false)
	expect(result.current.locations).toEqual(successValue)
})
