import useStoredDate from '@hooks/useStoredDate'
import moment from 'moment'
import { Dispatch, SetStateAction, useState } from 'react'
import { FocusedInputShape } from 'react-dates'

const MAX_NIGHTS = 7
const MIN_NIGHTS = 2

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
		if (startDate && endDate) return true
		else return false
	}

	return {
		startDate,
		endDate,
		focused,
		updateFocus: setFocused,
		isDayBlocked,
		updateDates,
		resetDates,
		isTooLong,
		isValid,
	}
}

export interface CalendarInterface {
	startDate: moment.Moment
	endDate: moment.Moment
	focused: FocusedInputShape
	updateFocus: Dispatch<SetStateAction<FocusedInputShape>>
	isDayBlocked: (day: moment.Moment) => boolean
	updateDates: ({
		startDate,
		endDate,
	}: {
		startDate: moment.Moment
		endDate: moment.Moment
	}) => void
	resetDates: () => void
	isTooLong: (startDate: moment.Moment, endDate: moment.Moment) => boolean
	isValid: () => boolean
}

const isTooLong = (startDate: moment.Moment, endDate: moment.Moment): boolean =>
	endDate?.diff(startDate, 'days') > MAX_NIGHTS

const isWeekend = (date: moment.Moment): boolean =>
	date.day() == 0 || date.day() == 6

export default useCalendar
