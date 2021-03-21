import { FormatError } from '@utils/errors'
import moment from 'moment'

export const stringToMoment = (date: string): moment.Moment => {
	const formattedDate = moment.utc(date, 'YYYY-MM-DD')
	if (!formattedDate.isValid() || date.length < 10) {
		throw new FormatError('Malformed date.')
	} else {
		return formattedDate
	}
}

export const momentToString = (date: moment.Moment): string => {
	if (!date) throw new FormatError('Date is not a valid moment')
	moment.locale('en-GB')
	return date.format('l')
}
