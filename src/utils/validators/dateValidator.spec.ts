import validateDates, { DateError } from '@utils/validators/dateValidator'
import { addDays, subDays } from 'date-fns'

it('missing dates', () => {
	const response = validateDates(null, null)
	expect(response[0]).toBe<boolean>(false)
	expect(response[1]).toBe<DateError>('missing')
})

it('identifies valid date ranges', () => {
	const startDate = new Date()
	const endDate = addDays(startDate, 3)

	const response = validateDates(startDate, endDate)
	expect(response).toEqual([true, null])
})

it('identifies overlong bookings', () => {
	const startDate = new Date()
	const endDate = addDays(startDate, 19)

	const response = validateDates(startDate, endDate)
	expect(response[0]).toBe<boolean>(false)
	expect(response[1]).toBe<DateError>('long')
})

it('identifies overshort bookings', () => {
	const startDate = new Date()
	const endDate = addDays(startDate, 1)

	const response = validateDates(startDate, endDate)
	expect(response[0]).toBe(false)
	expect(response[1]).toBe<DateError>('short')
})

it('identifies negative bookings', () => {
	const startDate = new Date()
	const endDate = subDays(startDate, 3)

	const response = validateDates(startDate, endDate)
	expect(response[0]).toBe(false)
	expect(response[1]).toBe<DateError>('impossible')
})
