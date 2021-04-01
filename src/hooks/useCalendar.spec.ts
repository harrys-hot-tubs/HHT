import useCalendar from '@hooks/useCalendar'
import { jest } from '@jest/globals'
import { act, renderHook } from '@testing-library/react-hooks'
import moment from 'moment'

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
	expect(startDate.isSame(moment(storedStartDate))).toBe(true)
	expect(endDate.isSame(moment(storedEndDate))).toBe(true)
})

it('defaults to the fallback if no data is available', () => {
	const { result } = renderHook(() => useCalendar())
	const { startDate, endDate } = result.current
	expect(startDate).toBe(null)
	expect(endDate).toBe(null)
})

it('sets values when updated', () => {
	const newStartDate = moment('2021-02-03')
	const newEndDate = moment('2021-02-06')

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

it('rejects weekends', () => {
	const storedStartDate = '2021-01-04'
	const weekendInRange = '2021-01-09'
	localStorage.setItem(startDateName, storedStartDate)

	const { result } = renderHook(() => useCalendar())
	act(() => {
		result.current.updateDates({
			startDate: null,
			endDate: moment(weekendInRange),
		})
	})

	expect(result.current.endDate?.isSame(moment(weekendInRange))).toBeFalsy()
	expect(localStorage.setItem).not.toHaveBeenCalledWith(
		endDateName,
		moment(weekendInRange).toISOString()
	)
})

it('ensures bookings are not too short', () => {
	const storedEndDate = '2021-01-05'
	const tooCloseDate = '2021-01-04'
	localStorage.setItem(endDateName, storedEndDate)

	const { result } = renderHook(() => useCalendar())
	act(() => {
		result.current.updateDates({
			startDate: moment(tooCloseDate),
			endDate: null,
		})
	})

	expect(result.current.startDate?.isSame(moment(tooCloseDate))).toBeFalsy()
	expect(localStorage.setItem).not.toHaveBeenCalledWith(
		startDateName,
		moment(tooCloseDate).toISOString()
	)
})
