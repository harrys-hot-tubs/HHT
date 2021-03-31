import {
	birmingham,
	centralLondon,
	sheffield,
} from '@fixtures/postcodeFixtures'
import usePostcode from '@hooks/usePostcode'
import { jest } from '@jest/globals'
import { act, renderHook } from '@testing-library/react-hooks'
import validatePostcode from '@utils/validators/postcodeValidator'

const mockValidator = validatePostcode as jest.Mock

jest.mock('@utils/validators')

const name = 'postcode'

afterEach(() => {
	localStorage.clear()
	jest.clearAllMocks()
})

it('accesses stored data if available', () => {
	const storedValue = birmingham
	localStorage.setItem(name, storedValue)

	const { result } = renderHook(() => usePostcode())
	const { value } = result.current
	expect(value).toBe(storedValue)
})

it('defaults to the fallback if no data is available', () => {
	const { result } = renderHook(() => usePostcode())
	const { value } = result.current
	expect(value).toBe('')
})

it('sets working value when updated', () => {
	const newValue = sheffield

	const { result } = renderHook(() => usePostcode())
	act(() => {
		result.current.setValue(newValue)
	})

	expect(result.current.value).toBe(newValue)
})

it('sets active data when updated', () => {
	const newValue = centralLondon

	const { result } = renderHook(() => usePostcode())
	act(() => {
		result.current.setValue(newValue)
	})

	expect(result.current.value).toBe(newValue)
})

it('informs loading when validating', async () => {
	mockValidator.mockResolvedValue([true, null])

	const { result, waitForNextUpdate } = renderHook(() => usePostcode())
	act(() => {
		result.current.validate()
	})

	expect(mockValidator).toHaveBeenCalled()
	expect(result.current.loading).toBe(true)
	await waitForNextUpdate()
	expect(result.current.loading).toBe(false)
})

it('does not store working value when validated if invalid', async () => {
	const errorMessage = 'invalid'
	mockValidator.mockResolvedValueOnce([false, errorMessage])

	const { result, waitForNextUpdate } = renderHook(() => usePostcode())

	act(() => {
		result.current.validate()
	})

	expect(result.current.loading).toBe(true)
	await waitForNextUpdate()
	expect(result.current.loading).toBe(false)
	expect(localStorage.setItem).not.toHaveBeenCalled()
})

it('provides a reason for invalid value', async () => {
	const errorMessage = 'invalid'
	mockValidator.mockResolvedValueOnce([false, errorMessage])

	const { result, waitForNextUpdate } = renderHook(() => usePostcode())

	act(() => {
		result.current.validate()
	})

	expect(result.current.loading).toBe(true)
	await waitForNextUpdate()
	expect(result.current.loading).toBe(false)
	expect(result.current.message).toEqual(errorMessage)
})

it('stores working value when validated if valid', async () => {
	mockValidator.mockReturnValueOnce([true, null])

	const { result, waitForNextUpdate } = renderHook(() => usePostcode())

	act(() => {
		result.current.validate()
	})

	expect(result.current.loading).toBe(true)
	await waitForNextUpdate()
	expect(result.current.loading).toBe(false)
	expect(localStorage.setItem).toHaveBeenLastCalledWith(
		name,
		result.current.value
	)
})
