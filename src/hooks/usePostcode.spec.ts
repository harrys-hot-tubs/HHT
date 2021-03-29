import {
	birmingham,
	centralLondon,
	sheffield,
} from '@fixtures/postcodeFixtures'
import usePostcode from '@hooks/usePostcode'
import { act, renderHook } from '@testing-library/react-hooks'

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

//TODO finish these tests refer to useAsyncValidatedInput

it('defaults to the fallback if no data is available', () => {
	const { result } = renderHook(() => usePostcode())
	const { value } = result.current
	expect(value).toBe('')
})

it('sets stored data when updated', () => {
	const newValue = sheffield

	const { result } = renderHook(() => usePostcode())
	act(() => {
		result.current.setValue(newValue)
	})

	expect(localStorage.setItem).toHaveBeenLastCalledWith(name, newValue)
})

it('sets active data when updated', () => {
	const newValue = centralLondon

	const { result } = renderHook(() => usePostcode())
	act(() => {
		result.current[1](newValue)
	})

	expect(result.current[0]).toBe(newValue)
})

it('overwrites stored data when updated', () => {
	const storedValue = 'test'
	const nextValue = 'next'
	localStorage.setItem(name, storedValue)

	const { result } = renderHook(() => usePostcode())
	expect(result.current[0]).toBe(storedValue)
	act(() => {
		result.current[1](nextValue)
	})

	expect(localStorage.setItem).toHaveBeenLastCalledWith(name, nextValue)
	expect(result.current[0]).toBe(nextValue)
})
