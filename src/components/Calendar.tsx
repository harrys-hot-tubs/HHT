import moment from 'moment'
import React, { useEffect, useState } from 'react'
import { Modal } from 'react-bootstrap'
import {
	CalendarDay,
	CalendarDayShape,
	DateRangePicker,
	FocusedInputShape,
} from 'react-dates'
import 'react-dates/initialize'
import 'react-dates/lib/css/_datepicker.css'

const MAX_NIGHTS = 7

interface ComponentProps {
	isStudent: boolean
	blockedDates?: moment.Moment[]
}

const Calendar = ({ isStudent, blockedDates = [] }: ComponentProps) => {
	const [startDate, setStartDate] = useState<moment.Moment>()
	const [endDate, setEndDate] = useState<moment.Moment>()
	const [focused, setFocused] = useState<FocusedInputShape>(null)
	const [showModal, setShowModal] = useState<boolean>(false)

	const isDayBlocked = (day: moment.Moment): boolean => {
		return (
			blockedDates.some((blockedDate) => blockedDate.isSame(day, 'D')) ||
			isWeekend(day)
		)
	}

	const renderCalendarDay = (props: CalendarDayShape) => {
		if (startDate && endDate) {
			// TODO check if range contains date and change render.
		}
		return <CalendarDay {...props} />
	}

	useEffect(() => {
		if (isTooLong(startDate, endDate) && !showModal) {
			setShowModal(true)
			setEndDate(null)
			// const delta = endDate?.diff(startDate, 'days') - MAX_NIGHTS
			// const newEndDate = endDate.clone().subtract(delta, 'days')
			// setEndDate(newEndDate)
		}
	}, [startDate, endDate])

	return (
		<React.Fragment>
			<DateRangePicker
				startDate={startDate}
				startDateId='ad'
				endDate={endDate}
				endDateId=''
				onDatesChange={({ startDate: nextStartDate, endDate: nextEndDate }) => {
					if (nextStartDate) setStartDate(nextStartDate)

					if (nextEndDate) setEndDate(nextEndDate)
				}}
				focusedInput={focused}
				onFocusChange={setFocused}
				isDayBlocked={isDayBlocked}
				minimumNights={isStudent ? 2 : 3}
				renderCalendarDay={renderCalendarDay}
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

const isTooLong = (startDate: moment.Moment, endDate: moment.Moment): boolean =>
	endDate?.diff(startDate, 'days') > MAX_NIGHTS

const isWeekend = (date: moment.Moment): boolean =>
	date.day() == 0 || date.day() == 6

export default Calendar
