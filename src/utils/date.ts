import moment from 'moment'

export const stringToMoment = (date: string): moment.Moment => {
	const formattedDate = moment(date)
	if (!formattedDate) throw new Error('Malformed date.')
	else return formattedDate
}

export const momentToString = (date: moment.Moment): string => {
	moment.locale('en-GB')
	return date?.format('l')
}
