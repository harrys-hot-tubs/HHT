import useStoredDate from '@hooks/useStoredDate'
import validateDates, { MAX_NIGHTS, MIN_NIGHTS } from '@utils/validators/dateValidator'
import moment from 'moment'
import { Dispatch, SetStateAction, useState } from 'react'
import { FocusedInputShape } from 'react-dates'

/**
 * Stores and validates user inputted booking dates.
 */
const useCalendar = (): CalendarInterface => {
	//TODO refactor this to use syncValidatedInput
	moment.locale('en-GB')
	const [startDate, setStartDate] = useStoredDate('startDate')
	const [endDate, setEndDate] = useStoredDate('endDate')
	const [focused, setFocused] = useState<FocusedInputShape | null>(null)
	const isDayBlocked = (day: moment.Moment): boolean => {
		return isWeekend(day)
	}

	const updateDates = ({
		startDate: newStartDate,
		endDate: newEndDate,
	}: {
		startDate: moment.Moment
		endDate: moment.Moment
	}) => {
		// TODO cleanup these conditions
		if (endDate) {
			if (
				newStartDate &&
				endDate.diff(newStartDate, 'days') >= MIN_NIGHTS &&
				!isWeekend(newStartDate)
			)
				setStartDate(newStartDate)
		} else {
			setStartDate(newStartDate)
		}

		if (startDate) {
			if (
				newEndDate &&
				newEndDate.diff(startDate, 'days') >= MIN_NIGHTS &&
				!isWeekend(newEndDate)
			)
				setEndDate(newEndDate)
		} else {
			setEndDate(newEndDate)
		}
	}

	const resetDates = () => {
		setStartDate(null)
		setEndDate(null)
	}

	const isValid = (): boolean => {
		return validateDates(startDate, endDate)[0]
	}

	const updateFocus = (newFocus: FocusedInputShape | null) => {
		if (newFocus === 'startDate') setStartDate(null)
		if (newFocus === 'endDate') setEndDate(null)
		setFocused(newFocus)
	}

	return {
		startDate,
		endDate,
		focused,
		updateFocus,
		isDayBlocked,
		updateDates,
		resetDates,
		isTooLong,
		isValid,
	}
}

export interface CalendarInterface {
	/**
	 * The start of a customer's booking.
	 */
	startDate: moment.Moment
	/**
	 * The end of a customer's booking.
	 */
	endDate: moment.Moment
	/**
	 * Either null, start or end date depending on which is in focus.
	 */
	focused: FocusedInputShape
	/**
	 * Function to update the stored focus of the calendar.
	 */
	updateFocus: Dispatch<SetStateAction<FocusedInputShape>>
	/**
	 * True if a given day is to be marked as unavailable.
	 */
	isDayBlocked: (day: moment.Moment) => boolean
	/**
	 * Function to update the stored dates.
	 */
	updateDates: ({
		startDate,
		endDate,
	}: {
		startDate: moment.Moment
		endDate: moment.Moment
	}) => void
	/**
	 * Function to reset the stored dates.
	 */
	resetDates: () => void
	/**
	 * True if a given booking exceeds the maximum allowed duration.
	 */
	isTooLong: (startDate: moment.Moment, endDate: moment.Moment) => boolean
	/**
	 * True if the booking meets all required conditions.
	 */
	isValid: () => boolean
}

/**
 * Determines whether a booking between two dates exceeds the maximum allowed duration.
 * @param startDate The start date of the customer's booking.
 * @param endDate The end date of the customer's booking.
 * @returns True if the duration of the booking exceeds the maximum allowed duration.
 */
const isTooLong = (startDate: moment.Moment, endDate: moment.Moment): boolean =>
	endDate?.diff(startDate, 'days') > MAX_NIGHTS

/**
 * Determines whether or not a given moment object is a weekend date.
 * @param date The moment object to be checked for its weekend status.
 * @returns True if the date is a weekend, false otherwise.
 */
const isWeekend = (date: moment.Moment): boolean =>
	date.day() == 0 || date.day() == 6

export default useCalendar
