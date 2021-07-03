import { differenceInDays } from 'date-fns'

/**
 * The maximum duration of a customer's booking.
 */
export const MAX_NIGHTS = 7
/**
 * The minimum duration of a customer's booking.
 */
export const MIN_NIGHTS = 2

export type DateError = 'missing' | 'long' | 'short' | 'impossible'

const validateDates = (
	startDate: Date,
	endDate: Date
): [boolean, DateError] => {
	if (!startDate || !endDate) return [false, 'missing']

	if (differenceInDays(endDate, startDate) < 0) return [false, 'impossible']

	if (differenceInDays(endDate, startDate) > MAX_NIGHTS) return [false, 'long']

	if (differenceInDays(endDate, startDate) < MIN_NIGHTS) return [false, 'short']

	return [true, null]
}

export default validateDates
