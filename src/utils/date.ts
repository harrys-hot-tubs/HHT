import { FormatError } from '@utils/errors'

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
	if (!date) throw new Error('Date is missing.')
	const today = new Date()
	return (
		date.getDate() === today.getDate() &&
		date.getMonth() === today.getMonth() &&
		date.getFullYear() === today.getFullYear()
	)
}
