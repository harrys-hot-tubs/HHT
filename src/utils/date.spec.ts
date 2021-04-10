import {
	seventeenthDecember,
	twentySecondApril,
	twentySecondAprilMoment,
} from '@fixtures/dateFixtures'
import {
	displayableMoment,
	extractBookingEnd,
	extractBookingStart,
	isToday,
	stringToMoment,
} from '@utils/date'
import { FormatError } from '@utils/errors'

describe('stringToMoment', () => {
	it('correctly parses valid dates', () => {
		const firstMoment = stringToMoment(twentySecondApril)

		expect(firstMoment.isValid()).toBeTruthy()
		expect(firstMoment.dayOfYear()).toBe(113)
		expect(firstMoment.date()).toBe(22)
		expect(firstMoment.year()).toBe(2000)
		expect(firstMoment.month() + 1).toBe(4)

		const secondMoment = stringToMoment(seventeenthDecember)

		expect(secondMoment.isValid()).toBeTruthy()
		expect(secondMoment.dayOfYear()).toBe(351)
		expect(secondMoment.date()).toBe(17)
		expect(secondMoment.year()).toBe(2021)
		expect(secondMoment.month() + 1).toBe(12)
	})

	it('fails to parse invalid dates', () => {
		expect(() => stringToMoment('-1-01-67')).toThrowError(FormatError)
		expect(() => stringToMoment('2000-01-67')).toThrowError(FormatError)
		expect(() => stringToMoment('2000-15-21')).toThrowError(FormatError)
		expect(() => stringToMoment('')).toThrowError(FormatError)
		expect(() => stringToMoment('ASDF')).toThrowError(FormatError)
		expect(() => stringToMoment('13')).toThrowError(FormatError)
	})
})

describe('displayableMoment', () => {
	it('parses dates to british format', () => {
		expect(displayableMoment(twentySecondAprilMoment)).toBe('22/4/2000')
	})

	it('does not parse invalid dates', () => {
		expect(() => displayableMoment(null)).toThrowError(FormatError)
	})
})

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
