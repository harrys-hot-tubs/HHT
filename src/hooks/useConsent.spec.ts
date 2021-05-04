import useConsent from '@hooks/useConsent'
import { act, renderHook } from '@testing-library/react-hooks'

const name = 'consent'

afterEach(() => {
	localStorage.clear()
	jest.clearAllMocks()
})

it('accesses stored data if available', () => {
	const storedValue = 'false'
	localStorage.setItem(name, storedValue)

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

	expect(localStorage.setItem).toHaveBeenLastCalledWith(name, String(newValue))
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
	const storedValue = 'false'
	const nextValue = true
	localStorage.setItem(name, storedValue)

	const { result } = renderHook(() => useConsent())
	expect(result.current[0]).toBe(false)
	act(() => {
		result.current[1](nextValue)
	})

	expect(localStorage.setItem).toHaveBeenLastCalledWith(name, String(nextValue))
	expect(result.current[0]).toBe(nextValue)
})
