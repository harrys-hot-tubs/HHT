import { driverAccount } from '@fixtures/accountFixtures'
import SWRWrapper from '@helpers/SWRWrapper'
import useAccountInformation from '@hooks/useAccountInformation'
import { inDateAccountToken } from '@test/fixtures/authFixtures'
import { act, renderHook } from '@testing-library/react-hooks'
import { GetAccountResponse } from '@typings/api/Accounts'
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import Cookies from 'js-cookie'
import { cache } from 'swr'

const mock = new MockAdapter(axios)
const successValue: GetAccountResponse = {
	error: false,
	account: driverAccount,
}

beforeEach(() => {
	Cookies.set('token', inDateAccountToken(driverAccount))
})

afterEach(() => {
	mock.reset()
	mock.resetHandlers()
	cache.clear()
})

it('indicates loading before receiving data', async () => {
	mock
		.onGet(`/api/accounts/${successValue.account.account_id}`)
		.replyOnce(200, successValue)
	const { result, waitForValueToChange } = renderHook(useAccountInformation, {
		wrapper: SWRWrapper,
	})

	expect(result.current.isLoading).toBe(true)
	await waitForValueToChange(() => result.current.isLoading)
})

it('stops indicating loading after receiving data', async () => {
	mock
		.onGet(`/api/accounts/${successValue.account.account_id}`)
		.replyOnce(200, successValue)
	const { result, waitForValueToChange } = renderHook(useAccountInformation, {
		wrapper: SWRWrapper,
	})

	await waitForValueToChange(() => result.current.isLoading)
	expect(result.current.isLoading).toBe(false)
})

it('responds with an error when request fails', async () => {
	const error = { message: 'failed' }
	mock
		.onGet(`/api/accounts/${successValue.account.account_id}`)
		.replyOnce(400, error)
	const { result, waitForValueToChange } = renderHook(useAccountInformation, {
		wrapper: SWRWrapper,
	})

	await waitForValueToChange(() => result.current.isLoading)
	expect(result.current.isLoading).toBe(false)
	expect(
		result.current.isError || Object.keys(result.current.account).length === 0
	).toBeTruthy()
})

it('responds with data when request succeeds', async () => {
	mock
		.onGet(`/api/accounts/${successValue.account.account_id}`)
		.replyOnce(200, successValue)
	const { result, waitForValueToChange } = renderHook(useAccountInformation, {
		wrapper: SWRWrapper,
	})

	await waitForValueToChange(() => result.current.isLoading)
	expect(result.current.isLoading).toBe(false)
	expect(result.current.account).toEqual(successValue.account)
})

it('allows the data to be changed using the mutate method', async () => {
	mock
		.onGet(`/api/accounts/${successValue.account.account_id}`)
		.replyOnce(200, successValue)
	const { result, waitForValueToChange } = renderHook(useAccountInformation, {
		wrapper: SWRWrapper,
	})

	await waitForValueToChange(() => result.current.isLoading)
	expect(result.current.account).toEqual(successValue.account)

	await act(async () => {
		await result.current.mutate({
			...successValue.account,
			first_name: 'Wendell',
		})
	})

	expect(result.current.account.first_name).toEqual('Wendell')
})

afterAll(() => {
	Cookies.remove('token')
})
