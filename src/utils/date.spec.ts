import {
	seventeenthDecember,
	twentySecondApril,
	twentySecondAprilMoment,
} from '@fixtures/dateFixtures'
import { displayableMoment, stringToMoment } from '@utils/date'
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
