import { storedOrder } from '@fixtures/orderFixtures'
import useOrders from '@hooks/useOrders'
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
	mock.onGet('/api/orders').replyOnce(200, ['as'])
	const { result, waitForNextUpdate } = renderHook(useOrders, {
		wrapper: SWRWrapper,
	})

	expect(result.current.isLoading).toBe(true)
	await waitForNextUpdate()
})

it('stops indicating loading after receiving data', async () => {
	mock.onGet('/api/orders').replyOnce(200, [])
	const { result, waitForNextUpdate } = renderHook(useOrders, {
		wrapper: SWRWrapper,
	})

	await waitForNextUpdate()
	expect(result.current.isLoading).toBe(false)
})

it('responds with an error when request fails', async () => {
	const error = { message: 'failed' }
	mock.onGet('/api/orders').replyOnce(400, error)
	const { result, waitForNextUpdate } = renderHook(useOrders, {
		wrapper: SWRWrapper,
	})

	await waitForNextUpdate()
	expect(result.current.isError).toBeTruthy()
})

it('responds with data when request succeeds', async () => {
	mock.onGet('/api/orders').replyOnce(200, [storedOrder])
	const { result, waitForNextUpdate } = renderHook(useOrders, {
		wrapper: SWRWrapper,
	})

	await waitForNextUpdate()
	expect(result.current.isLoading).toBe(false)
	expect(result.current.orders).toHaveLength(1)
	expect(result.current.orders).toEqual([storedOrder])
})
