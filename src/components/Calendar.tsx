import { CalendarInterface } from '@hooks/useCalendar'
import React, { useEffect, useState } from 'react'
import { Modal } from 'react-bootstrap'
import { DateRangePicker } from 'react-dates'
import 'react-dates/initialize'

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
	isTooLong,
	startDate,
	endDate,
	focused,
	updateFocus,
	updateDates,
	resetDates,
	isDayBlocked,
}: ComponentProps) => {
	const [showModal, setShowModal] = useState(false)
	useEffect(() => {
		if (isTooLong(startDate, endDate) && !showModal) {
			setShowModal(true)
			resetDates()
		}
	}, [startDate, endDate])

	return (
		<React.Fragment>
			<DateRangePicker
				numberOfMonths={1}
				startDate={startDate}
				startDateId='startDate'
				endDate={endDate}
				endDateId='endDate'
				onDatesChange={updateDates}
				focusedInput={focused}
				onFocusChange={updateFocus}
				isDayBlocked={isDayBlocked}
				minimumNights={isStudent ? 2 : 3}
			/>
			<Modal show={showModal} onHide={() => setShowModal(false)}>
				<Modal.Header closeButton>
					<Modal.Title>Oh no!</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					Sadly we don't yet offer hires for longer than 7 days at the moment.
					If you still really want that extra time, call the number below.
				</Modal.Body>
				<Modal.Footer>
					<a href='tel:+447554002075'>07554 002075</a>
				</Modal.Footer>
			</Modal>
		</React.Fragment>
	)
}

export default Calendar
