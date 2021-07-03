import { extractBookingEnd, extractBookingStart, isToday } from '@utils/date'

describe('extractBookingStart', () => {
	it('correctly extracts dates', () => {
		expect(extractBookingStart('[2021-03-05,2021-03-08)')).toEqual(
			new Date('2021-03-05')
		)
		expect(extractBookingStart('[2021-03-01,2021-03-04)')).toEqual(
			new Date('2021-03-01')
		)
		expect(extractBookingStart('[2021-03-19,2021-03-22)')).toEqual(
			new Date('2021-03-19')
		)
	})

	it('throws an error on missing dates', () => {
		expect(() => extractBookingStart('')).toThrowError()
		expect(() => extractBookingStart(null)).toThrowError()
		expect(() => extractBookingStart(undefined)).toThrowError()
	})
})

describe('extractBookingEnd', () => {
	it('correctly extracts dates', () => {
		expect(extractBookingEnd('[2021-03-05,2021-03-08)')).toEqual(
			new Date('2021-03-08')
		)
		expect(extractBookingEnd('[2021-03-01,2021-03-04)')).toEqual(
			new Date('2021-03-04')
		)
		expect(extractBookingEnd('[2021-03-19,2021-03-22)')).toEqual(
			new Date('2021-03-22')
		)
	})

	it('throws an error on missing dates', () => {
		expect(() => extractBookingEnd('')).toThrowError()
		expect(() => extractBookingEnd(null)).toThrowError()
		expect(() => extractBookingEnd(undefined)).toThrowError()
	})
})

describe('isToday', () => {
	it('returns true if the date is today', () => {
		expect(isToday(new Date())).toBe(true)
	})

	it('returns false if the date is not today', () => {
		expect(isToday(new Date('2021-01-01'))).toBe(false)
	})

	it('throws an error if the date is missing', () => {
		expect(() => isToday(null)).toThrowError()
		expect(() => isToday(undefined)).toThrowError()
	})
})
