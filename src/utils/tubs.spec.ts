import {
	DIFFERENT_SIZES,
	MIXED_SIZES,
	SAME_SIZES,
} from '@test/fixtures/tubsFixtures'
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
		const forDisplay = displayableTubs(SAME_SIZES)
		expect(forDisplay.length).toBe(1)
		expect(forDisplay).toContainNOf(SAME_SIZES)
	})

	it('displays all tubs of different sizes', () => {
		const forDisplay = displayableTubs(DIFFERENT_SIZES)
		expect(forDisplay.length).toBe(DIFFERENT_SIZES.length)
		expect(forDisplay).toEqual(expect.arrayContaining(DIFFERENT_SIZES))
	})

	it('reduces the number of tubs displayed if multiple have the same capacity', () => {
		const forDisplay = displayableTubs(MIXED_SIZES)
		expect(forDisplay.length).toBe(DIFFERENT_SIZES.length + 1)
		expect(forDisplay).toContainNOf(SAME_SIZES, 1)
	})
})
