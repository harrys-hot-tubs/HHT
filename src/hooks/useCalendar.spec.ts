import useCalendar from '@hooks/useCalendar'
import { jest } from '@jest/globals'
import { act, renderHook } from '@testing-library/react-hooks'
import { isSameDay } from 'date-fns'

const startDateName = 'startDate'
const endDateName = 'endDate'

afterEach(() => {
	localStorage.clear()
	jest.clearAllMocks()
})

it('accesses stored data if available', () => {
	const storedStartDate = '2021-01-01'
	const storedEndDate = '2021-01-05'
	localStorage.setItem(startDateName, storedStartDate)
	localStorage.setItem(endDateName, storedEndDate)

	const { result } = renderHook(() => useCalendar())
	const { startDate, endDate } = result.current
	expect(isSameDay(startDate, new Date(storedStartDate))).toBe(true)
	expect(isSameDay(endDate, new Date(storedEndDate))).toBe(true)
})

it('defaults to the fallback if no data is available', () => {
	const { result } = renderHook(() => useCalendar())
	const { startDate, endDate } = result.current
	expect(startDate).toBe(null)
	expect(endDate).toBe(null)
})

it('sets values when updated', () => {
	const newStartDate = new Date('2021-02-03')
	const newEndDate = new Date('2021-02-06')

	const { result } = renderHook(() => useCalendar())
	act(() => {
		result.current.updateDates({ startDate: newStartDate, endDate: newEndDate })
	})

	expect(result.current.startDate).toEqual(newStartDate)
	expect(result.current.endDate).toEqual(newEndDate)
	expect(localStorage.setItem).toHaveBeenCalledWith(
		startDateName,
		newStartDate.toISOString()
	)
	expect(localStorage.setItem).toHaveBeenCalledWith(
		endDateName,
		newEndDate.toISOString()
	)
})
