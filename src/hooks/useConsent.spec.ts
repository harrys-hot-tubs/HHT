import useConsent from '@hooks/useConsent'
import { act, renderHook } from '@testing-library/react-hooks'
import { ValueWithExpiration } from './useStoredStateWithExpiration'

const name = 'consent'

afterEach(() => {
	localStorage.clear()
	jest.clearAllMocks()
})

it('accesses stored data if available', () => {
	const stored: ValueWithExpiration = {
		value: 'false',
		exp: Date.now() + 3600 * 1000,
	}
	localStorage.setItem(name, JSON.stringify(stored))

	const { result } = renderHook(() => useConsent())
	const [value] = result.current
	expect(value).toBe(false)
})

it('defaults to the fallback if no data is available', () => {
	const { result } = renderHook(() => useConsent())
	const [value] = result.current
	expect(value).toBe(undefined)
})

it('sets stored data when updated', () => {
	const newValue = false

	const { result } = renderHook(() => useConsent())
	act(() => {
		result.current[1](newValue)
	})

	expect(localStorage.setItem).toHaveBeenLastCalledWith(
		name,
		expect.stringContaining(`"value":"${newValue}"`)
	)
})

it('sets active data when updated', () => {
	const newValue = true

	const { result } = renderHook(() => useConsent())
	act(() => {
		result.current[1](newValue)
	})

	expect(result.current[0]).toBe(newValue)
})

it('overwrites stored data when updated', () => {
	const stored: ValueWithExpiration = {
		value: 'false',
		exp: Date.now() + 3600 * 1000,
	}
	const nextValue = true
	localStorage.setItem(name, JSON.stringify(stored))

	const { result } = renderHook(() => useConsent())
	expect(result.current[0]).toBe(false)
	act(() => {
		result.current[1](nextValue)
	})

	expect(localStorage.setItem).toHaveBeenLastCalledWith(
		name,
		expect.stringContaining(`"value":"${nextValue}"`)
	)
	expect(result.current[0]).toBe(nextValue)
})
