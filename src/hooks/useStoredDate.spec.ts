import {
	seventeenthDecemberDate,
	twentySecondApril,
	twentySecondAprilDate,
} from '@fixtures/dateFixtures'
import useStoredDate from '@hooks/useStoredDate'
import { act, renderHook } from '@testing-library/react-hooks'
import { isSameDay } from 'date-fns'

const name = 'test'

afterEach(() => {
	localStorage.clear()
})

it('accesses stored data if available', () => {
	const storedValue = twentySecondApril
	localStorage.setItem(name, storedValue)

	const { result } = renderHook(() => useStoredDate(name))
	const [value] = result.current
	expect(isSameDay(twentySecondAprilDate, value)).toBe(true)
})

it('defaults to the fallback if no data is available', () => {
	const { result } = renderHook(() => useStoredDate(name))
	const [value] = result.current
	expect(value).toBe(null)
})

it('sets stored data when updated', () => {
	const storedValue = seventeenthDecemberDate

	const { result } = renderHook(() => useStoredDate(name))
	act(() => {
		result.current[1](storedValue)
	})

	expect(localStorage.setItem).toHaveBeenLastCalledWith(
		name,
		storedValue.toISOString()
	)
})

it('sets active data when updated', () => {
	const storedValue = twentySecondAprilDate

	const { result } = renderHook(() => useStoredDate(name))
	act(() => {
		result.current[1](storedValue)
	})

	expect(result.current[0]).toBe(storedValue)
})

it('overwrites stored data when updated', () => {
	const storedValue = seventeenthDecemberDate.toISOString()
	const nextValue = twentySecondAprilDate
	localStorage.setItem(name, storedValue)

	const { result } = renderHook(() => useStoredDate(name))
	const [value] = result.current
	expect(isSameDay(seventeenthDecemberDate, value)).toBe(true)
	act(() => {
		result.current[1](nextValue)
	})

	expect(localStorage.setItem).toHaveBeenLastCalledWith(
		name,
		nextValue.toISOString()
	)
	expect(result.current[0]).toBe(nextValue)
})
