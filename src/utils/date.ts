import { FormatError } from '@utils/errors'
import moment from 'moment'

export const stringToMoment = (date: string): moment.Moment => {
	const formattedDate = moment.utc(date, true)
	if (!formattedDate.isValid()) {
		throw new FormatError('Malformed date.')
	} else {
		return formattedDate
	}
}

/**
 * Converts a moment object into a human readable string.
 * @param date A moment object.
 * @returns A string representation of the moment that can be displayed to the user.
 */
export const displayableMoment = (date: moment.Moment): string => {
	if (!date) throw new FormatError('Date is not a valid moment')
	return date.format('D/M/YYYY')
}

/**
 * Determines the date at which a booking begins.
 * @param bookingDuration The duration of a booking stored in the database.
 * @returns A date object representing the start of the booking.
 */
export const extractBookingStart = (bookingDuration: string): Date => {
	const parsedDate = new Date(bookingDuration.substring(1, 11))
	if (isNaN(parsedDate.getTime())) throw new FormatError('Date is malformed')
	return parsedDate
}

/**
 * Determines the date at which a booking ends.
 * @param bookingDuration The duration of a booking stored in the database.
 * @returns A date object representing the end of the booking.
 */
export const extractBookingEnd = (bookingDuration: string): Date => {
	const parsedDate = new Date(bookingDuration.substring(12, 22))
	if (isNaN(parsedDate.getTime())) throw new FormatError('Date is malformed')
	return parsedDate
}

/**
 * Determines whether or not a given date is today.
 * @param date A date object.
 * @returns True if the date object is today.
 */
export const isToday = (date: Date): boolean => {
	return date.getTime() === new Date().getTime()
}
