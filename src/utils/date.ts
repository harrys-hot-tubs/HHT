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

export const displayableMoment = (date: moment.Moment): string => {
	if (!date) throw new FormatError('Date is not a valid moment')
	return date.format('D/M/YYYY')
}
