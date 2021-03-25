import {
	newMillenniumDate,
	newMillenniumMoment,
	randomDate,
} from '@fixtures/dateFixtures'
import { momentToString, stringToMoment } from '@utils/date'
import { FormatError } from '@utils/errors'

describe('stringToMoment', () => {
	it('correctly parses valid dates', () => {
		const newMillenniumMoment = stringToMoment(newMillenniumDate)

		expect(newMillenniumMoment.isValid()).toBeTruthy()
		expect(newMillenniumMoment.dayOfYear()).toBe(113)
		expect(newMillenniumMoment.date()).toBe(22)
		expect(newMillenniumMoment.year()).toBe(2000)
		expect(newMillenniumMoment.month() + 1).toBe(4)

		const randomMoment = stringToMoment(randomDate)

		expect(randomMoment.isValid()).toBeTruthy()
		expect(randomMoment.dayOfYear()).toBe(351)
		expect(randomMoment.date()).toBe(17)
		expect(randomMoment.year()).toBe(2021)
		expect(randomMoment.month() + 1).toBe(12)
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

describe('momentToString', () => {
	it('parses dates to british format', () => {
		expect(momentToString(newMillenniumMoment)).toBe('22/4/2000')
	})

	it('does not parse invalid dates', () => {
		expect(() => momentToString(null)).toThrowError(FormatError)
	})
})
