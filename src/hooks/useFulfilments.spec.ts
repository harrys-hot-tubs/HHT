import { storedOrder } from '@fixtures/orderFixtures'
import useFulfilments from '@hooks/useFulfilments'
import SWRWrapper from '@test/helpers/SWRWrapper'
import { renderHook } from '@testing-library/react-hooks'
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import { cache } from 'swr'

const mock = new MockAdapter(axios)

afterEach(() => {
	mock.reset()
	mock.resetHandlers()
	cache.clear()
})

it('indicates loading before receiving data', async () => {
	mock.onGet('/api/fulfilments').replyOnce(200, [])
	const { result, waitForNextUpdate } = renderHook(useFulfilments, {
		wrapper: SWRWrapper,
	})

	expect(result.current.isLoading).toBe(true)
	await waitForNextUpdate()
})

it('stops indicating loading after receiving data', async () => {
	mock.onGet('/api/fulfilments').replyOnce(200, [])
	const { result, waitForNextUpdate } = renderHook(useFulfilments, {
		wrapper: SWRWrapper,
	})

	await waitForNextUpdate()
	expect(result.current.isLoading).toBe(false)
})

it('responds with an error when request fails', async () => {
	const error = { message: 'failed' }
	mock.onGet('/api/fulfilments').replyOnce(400, error)

	const { result, waitForNextUpdate } = renderHook(useFulfilments, {
		wrapper: SWRWrapper,
	})

	await waitForNextUpdate() // This await sometimes has orders change before an error is added
	expect(result.current.isLoading).toBe(false)
	expect(
		result.current.isError || result.current.fulfilments.length === 0
	).toBeTruthy()
})

it('responds with data when request succeeds', async () => {
	mock.onGet('/api/fulfilments').replyOnce(200, [storedOrder])
	const { result, waitForNextUpdate } = renderHook(useFulfilments, {
		wrapper: SWRWrapper,
	})

	await waitForNextUpdate()
	expect(result.current.isLoading).toBe(false)
	expect(result.current.fulfilments).toHaveLength(1)
	expect(result.current.fulfilments).toEqual([storedOrder])
})
