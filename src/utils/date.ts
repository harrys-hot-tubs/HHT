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

export const extractBookingStart = (bookingDuration: string): Date => {
	const parsedDate = new Date(bookingDuration.substring(1, 11))
	if (isNaN(parsedDate.getTime())) throw new FormatError('Date is malformed')
	return parsedDate
}

export const extractBookingEnd = (bookingDuration: string): Date => {
	const parsedDate = new Date(bookingDuration.substring(12, 22))
	if (isNaN(parsedDate.getTime())) throw new FormatError('Date is malformed')
	return parsedDate
}

export const isToday = (date: Date): boolean => {
	return date.getTime() === new Date().getTime()
}
