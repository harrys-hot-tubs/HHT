import useDateRange from '@hooks/useDateRange'
import validateDates, {
	MAX_NIGHTS,
	MIN_NIGHTS,
} from '@utils/validators/dateValidator'
import { differenceInDays, getDay } from 'date-fns'

/**
 * Stores and validates user inputted booking dates.
 */
const useCalendar = (): CalendarInterface => {
	const {
		rangeStart: startDate,
		rangeEnd: endDate,
		setRangeStart: setStartDate,
		setRangeEnd: setEndDate,
		resetRangeStart: resetStartDate,
		resetRangeEnd: resetEndDate,
	} = useDateRange({
		startKey: 'startDate',
		endKey: 'endDate',
	})

	const updateDates = ({
		startDate: newStartDate,
		endDate: newEndDate,
	}: {
		startDate?: Date
		endDate?: Date
	}) => {
		if (newStartDate) setStartDate(newStartDate)
		if (newEndDate) setEndDate(newEndDate)
	}

	const resetDates = ({
		startDate,
		endDate,
	}: {
		startDate?: boolean
		endDate?: boolean
	}) => {
		if (startDate) resetStartDate()
		if (endDate) resetEndDate()
	}

	const isValid = (): boolean => {
		return validateDates(startDate, endDate)[0]
	}

	return {
		startDate,
		endDate,
		isAvailable: (date: Date) => !isWeekend(date),
		updateDates,
		resetDates,
		isWrongDuration,
		isValid,
	}
}

export interface CalendarInterface {
	/**
	 * The start of a customer's booking.
	 */
	startDate: Date
	/**
	 * The end of a customer's booking.
	 */
	endDate: Date
	/**
	 * True if a given day is to be marked as available.
	 */
	isAvailable: (day: Date) => boolean
	/**
	 * Function to update the stored dates.
	 */
	updateDates: ({
		startDate,
		endDate,
	}: {
		startDate?: Date
		endDate?: Date
	}) => void
	/**
	 * Function to reset the stored dates.
	 */
	resetDates: ({
		startDate,
		endDate,
	}: {
		startDate?: boolean
		endDate?: boolean
	}) => void
	/**
	 * True if a given booking exceeds the maximum allowed duration or subceeds the mimimum allowed duration.
	 */
	isWrongDuration: (startDate: Date, endDate: Date) => boolean
	/**
	 * True if the booking meets all required conditions.
	 */
	isValid: () => boolean
}

/**
 * Determines whether a booking between two dates exceeds the maximum allowed duration or subceeds the minimum allowed duration.
 * @param startDate The start date of the customer's booking.
 * @param endDate The end date of the customer's booking.
 * @returns True if the duration of the booking is of an inappropriate duration, false otherwise.
 */
const isWrongDuration = (startDate: Date, endDate: Date): boolean =>
	differenceInDays(endDate, startDate) > MAX_NIGHTS ||
	differenceInDays(endDate, startDate) < MIN_NIGHTS

/**
 * Determines whether or not a given date falls on the weekend.
 * @param date The {@link Date} object to be checked for its weekend status.
 * @returns True if the date is a weekend, false otherwise.
 */
const isWeekend = (date: Date): boolean => {
	const day = getDay(date)
	return day == 0 || day == 6
}

export default useCalendar
