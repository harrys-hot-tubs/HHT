import { differentSizes, mixedSizes, sameSize } from '@fixtures/tubsFixtures'
import { displayableTubs } from '@utils/tubs'

expect.extend({
	toContainNOf<T>(received: T[], elements: T[], n: number = 1) {
		const pass =
			elements.map((e) => received.includes(e)).filter(Boolean).length === n
		return {
			message: () =>
				`expected ${received} to contain one element of ${elements}`,
			pass,
		}
	},
})

declare global {
	namespace jest {
		interface Matchers<R> {
			toContainNOf<T>(elements: T[], n?: number): R
		}
	}
}

describe('displayableTubs', () => {
	it('should return only one tub of each size', () => {
		const forDisplay = displayableTubs(sameSize)
		expect(forDisplay.length).toBe(1)
		expect(forDisplay).toContainNOf(sameSize)
	})

	it('displays all tubs of different sizes', () => {
		const forDisplay = displayableTubs(differentSizes)
		expect(forDisplay.length).toBe(differentSizes.length)
		expect(forDisplay).toEqual(expect.arrayContaining(differentSizes))
	})

	it('reduces the number of tubs displayed if multiple have the same capacity', () => {
		const forDisplay = displayableTubs(mixedSizes)
		expect(forDisplay.length).toBe(differentSizes.length + 1)
		expect(forDisplay).toContainNOf(sameSize, 1)
	})

	it('returns an empty array when no tubs are passed', () => {
		const forDisplay = displayableTubs([])
		expect(forDisplay).toEqual([])
	})
})
