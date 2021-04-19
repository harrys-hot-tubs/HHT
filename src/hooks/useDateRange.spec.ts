import { seventeenthDecember, twentySecondApril } from '@fixtures/dateFixtures'
import { act, renderHook } from '@testing-library/react-hooks'
import useDateRange from './useDateRange'

const startKey = 'startKey'
const endKey = 'endKey'

afterEach(() => {
	localStorage.clear()
})

it('accesses stored data if available', () => {
	const storedValue = twentySecondApril
	localStorage.setItem(startKey, storedValue)

	const { result } = renderHook(() => useDateRange({ startKey, endKey }))
	const { rangeStart: value } = result.current
	expect(new Date(twentySecondApril)).toEqual(value)
})

it('defaults to the fallback if no data is available', () => {
	const { result } = renderHook(() => useDateRange({ startKey, endKey }))
	const { rangeStart: value } = result.current
	expect(value <= new Date()).toBe(true)
})

it('sets stored data when updated', () => {
	const newValue = new Date(seventeenthDecember)

	const { result } = renderHook(() => useDateRange({ startKey, endKey }))
	act(() => result.current.setRangeEnd(newValue))

	expect(localStorage.setItem).toHaveBeenLastCalledWith(
		endKey,
		newValue.toISOString()
	)
})

it('sets active data when updated', () => {
	const newValue = new Date(twentySecondApril)

	const { result } = renderHook(() => useDateRange({ startKey, endKey }))
	act(() => {
		result.current.setRangeStart(newValue)
	})

	expect(result.current.rangeStart).toBe(newValue)
})

it('overwrites stored data when updated', () => {
	const storedValue = new Date(seventeenthDecember)
	const nextValue = new Date(twentySecondApril)
	localStorage.setItem(startKey, storedValue.toISOString())

	const { result } = renderHook(() => useDateRange({ startKey, endKey }))
	expect(result.current.rangeStart).toEqual(storedValue)
	act(() => result.current.setRangeStart(nextValue))

	expect(localStorage.setItem).toHaveBeenLastCalledWith(
		startKey,
		nextValue.toISOString()
	)
	expect(result.current.rangeStart).toBe(nextValue)
})

it('swaps dates when a range of an incorrect order is entered', () => {
	const earlierDate = new Date('2002-09-12')
	const laterDate = new Date('2005-11-09')

	const { result } = renderHook(() => useDateRange({ startKey, endKey }))
	act(() => result.current.setRangeStart(laterDate))
	act(() => result.current.setRangeEnd(earlierDate))

	expect(localStorage.setItem).toHaveBeenCalledWith(
		startKey,
		earlierDate.toISOString()
	)
	expect(localStorage.setItem).toHaveBeenCalledWith(
		endKey,
		laterDate.toISOString()
	)
	expect(result.current.rangeStart).toBe(earlierDate)
	expect(result.current.rangeEnd).toBe(laterDate)
})
