const MAX_NIGHTS = 7
const MIN_NIGHTS = 2

export type DateError = 'missing' | 'long' | 'short'

const validateDates = (
	startDate: moment.Moment,
	endDate: moment.Moment
): [boolean, DateError] => {
	if (!startDate || !endDate) return [false, 'missing']

	if (endDate.diff(startDate) > MAX_NIGHTS) return [false, 'long']

	if (endDate.diff(startDate) < MIN_NIGHTS) return [false, 'short']

	return [true, null]
}

export default validateDates
