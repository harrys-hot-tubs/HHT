import {
	NEW_MILLENNIUM_DATE,
	NEW_MILLENNIUM_MOMENT,
	RANDOM_DATE,
} from '@test/fixtures/dateFixtures'
import { momentToString, stringToMoment } from '@utils/date'
import { FormatError } from './errors'

describe('stringToMoment', () => {
	it('correctly parses valid dates', () => {
		const newMillenniumMoment = stringToMoment(NEW_MILLENNIUM_DATE)

		expect(newMillenniumMoment.isValid()).toBeTruthy()
		expect(newMillenniumMoment.dayOfYear()).toBe(1)
		expect(newMillenniumMoment.date()).toBe(1)
		expect(newMillenniumMoment.year()).toBe(2000)
		expect(newMillenniumMoment.month() + 1).toBe(1)

		const randomMoment = stringToMoment(RANDOM_DATE)

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
		expect(momentToString(NEW_MILLENNIUM_MOMENT)).toBe('1/1/2000')
	})

	it('does not parse invalid dates', () => {
		expect(() => momentToString(null)).toThrowError(FormatError)
	})
})
