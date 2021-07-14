import { CalendarInterface } from '@hooks/useCalendar'
import { addBusinessDays, addDays, isWeekend } from 'date-fns'
import React, { forwardRef, useEffect } from 'react'
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

	const StartInput = forwardRef<HTMLInputElement, any>(
		({ value, onClick }, ref) => (
			<button
				className='inline-picker hire'
				onClick={onClick}
				type='button'
				ref={ref}
				id='start'
			>
				{value || 'Start Date'}
			</button>
		)
	)

	const EndInput = forwardRef<HTMLInputElement, any>(
		({ value, onClick }, ref) => (
			<button
				className='inline-picker hire'
				onClick={onClick}
				type='button'
				ref={ref}
				id='end'
			>
				{value || 'End Date'}
			</button>
		)
	)

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
					dateFormat='dd/MM/yyyy'
					placeholderText='Start Date'
					disabledKeyboardNavigation
					popperPlacement='top-start'
					customInput={<StartInput />}
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
					dateFormat='dd/MM/yyyy'
					placeholderText='End Date'
					disabledKeyboardNavigation
					popperPlacement='top-end'
					customInput={<EndInput />}
				/>
			</span>
		</React.Fragment>
	)
}

export default Calendar
