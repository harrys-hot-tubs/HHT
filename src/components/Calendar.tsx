import { CalendarInterface } from '@hooks/useCalendar'
import { addBusinessDays, addDays, isWeekend } from 'date-fns'
import React, { useEffect } from 'react'
import { default as DatePicker } from 'react-datepicker'

interface ComponentProps extends CalendarInterface {
	/**
	 * Whether or not the current customer is a student.
	 */
	isStudent?: boolean
}

/**
 * Calendar component that allows the user to select a date range to book their hot tub between.
 */
const Calendar = ({
	isStudent = true,
	isWrongDuration,
	startDate,
	endDate,
	updateDates,
	resetDates,
	isAvailable,
}: ComponentProps) => {
	useEffect(() => {
		// Checks for malicious date injection.
		if (!isAvailable(startDate)) resetDates({ startDate: true })
		if (!isAvailable(endDate)) resetDates({ endDate: true })
		if (isWrongDuration(startDate, endDate)) resetDates({ endDate: true })
	}, [startDate, endDate])

	return (
		<React.Fragment>
			<span className='date-pickers'>
				<DatePicker
					selected={startDate}
					startDate={startDate}
					endDate={endDate}
					selectsStart
					onChange={(date: Date) => updateDates({ startDate: date })}
					minDate={new Date()}
					filterDate={isAvailable}
					todayButton={!isWeekend(new Date()) ? 'Today' : null}
					className='inline-picker hire'
					id='start'
					dateFormat='dd/MM/yyyy'
					placeholderText='Start Date'
					disabledKeyboardNavigation
				/>
				<span> to </span>
				<DatePicker
					selected={endDate}
					startDate={startDate}
					endDate={endDate}
					selectsEnd
					openToDate={endDate ? endDate : startDate ? startDate : new Date()}
					onChange={(date: Date) => updateDates({ endDate: date })}
					minDate={addBusinessDays(
						startDate ? startDate : new Date(),
						isStudent ? 2 : 3
					)}
					maxDate={addDays(startDate, 7)}
					filterDate={isAvailable}
					className='inline-picker hire'
					id='end'
					dateFormat='dd/MM/yyyy'
					placeholderText='End Date'
					disabledKeyboardNavigation
				/>
			</span>
		</React.Fragment>
	)
}

export default Calendar
