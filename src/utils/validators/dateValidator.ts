const MAX_NIGHTS = 7
const MIN_NIGHTS = 2

export type DateError = 'missing' | 'long' | 'short' | 'impossible'

const validateDates = (
	startDate: moment.Moment,
	endDate: moment.Moment
): [boolean, DateError] => {
	if (!startDate || !endDate) return [false, 'missing']

	if (endDate.diff(startDate, 'days') < 0) return [false, 'impossible']

	if (endDate.diff(startDate, 'days') > MAX_NIGHTS) return [false, 'long']

	if (endDate.diff(startDate, 'days') < MIN_NIGHTS) return [false, 'short']

	return [true, null]
}

export default validateDates
