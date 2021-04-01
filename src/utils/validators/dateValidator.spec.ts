import validateDates, { DateError } from '@utils/validators/dateValidator'
import moment from 'moment'

it('missing dates', () => {
	const response = validateDates(null, null)
	expect(response[0]).toBe<boolean>(false)
	expect(response[1]).toBe<DateError>('missing')
})

it('identifies valid date ranges', () => {
	const startDate = moment(Date.now())
	const endDate = moment(startDate.clone().add(3, 'days'))

	const response = validateDates(startDate, endDate)
	expect(response).toEqual([true, null])
})

it('identifies overlong bookings', () => {
	const startDate = moment(Date.now())
	const endDate = moment(startDate.clone().add(19, 'days'))

	const response = validateDates(startDate, endDate)
	expect(response[0]).toBe<boolean>(false)
	expect(response[1]).toBe<DateError>('long')
})

it('identifies overshort bookings', () => {
	const startDate = moment(Date.now())
	const endDate = moment(startDate.clone().add(1, 'days'))

	const response = validateDates(startDate, endDate)
	expect(response[0]).toBe(false)
	expect(response[1]).toBe<DateError>('short')
})

it('identifies negative bookings', () => {
	const startDate = moment(Date.now())
	const endDate = moment(startDate.clone().add(-3, 'days'))

	const response = validateDates(startDate, endDate)
	expect(response[0]).toBe(false)
	expect(response[1]).toBe<DateError>('impossible')
})
