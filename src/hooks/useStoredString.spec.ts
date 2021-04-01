import useStoredString from '@hooks/useStoredString'
import { act, renderHook } from '@testing-library/react-hooks'

const name = 'test'

afterEach(() => {
	localStorage.clear()
})

it('accesses stored data if available', () => {
	const storedValue = 'test'
	localStorage.setItem(name, storedValue)

	const { result } = renderHook(() => useStoredString(name))
	const [value] = result.current
	expect(value).toBe(storedValue)
})

it('defaults to the fallback if no data is available', () => {
	const { result } = renderHook(() => useStoredString(name))
	const [value] = result.current
	expect(value).toBe('')
})

it('sets stored data when updated', () => {
	const storedValue = 'test'

	const { result } = renderHook(() => useStoredString(name))
	act(() => {
		result.current[1](storedValue)
	})

	expect(localStorage.setItem).toHaveBeenLastCalledWith(name, storedValue)
})

it('sets active data when updated', () => {
	const storedValue = 'test'

	const { result } = renderHook(() => useStoredString(name))
	act(() => {
		result.current[1](storedValue)
	})

	expect(result.current[0]).toBe(storedValue)
})

it('overwrites stored data when updated', () => {
	const storedValue = 'test'
	const nextValue = 'next'
	localStorage.setItem(name, storedValue)

	const { result } = renderHook(() => useStoredString(name))
	expect(result.current[0]).toBe(storedValue)
	act(() => {
		result.current[1](nextValue)
	})

	expect(localStorage.setItem).toHaveBeenLastCalledWith(name, nextValue)
	expect(result.current[0]).toBe(nextValue)
})
