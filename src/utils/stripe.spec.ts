import { formatAmount, getStripe, priceToString } from '@utils/stripe'

describe('getStripe', () => {
	it('creates instance', () => {
		expect(async () => await getStripe()).toBeTruthy()
	})

	it('creates only one instance', async () => {
		const firstInstance = await getStripe()
		const secondInstance = await getStripe()
		expect(secondInstance).toEqual(firstInstance)
	})
})

describe('formatAmount', () => {
	it('should format valid prices', () => {
		expect(formatAmount(100)).toBe(10000)
		expect(formatAmount(1)).toBe(100)
		expect(formatAmount(20.65)).toBe(2065)
		expect(formatAmount(78.123)).toBe(7812)
		expect(formatAmount(4637.126)).toBe(463713)
	})

	it('should not format invalid prices', () => {
		expect(() => formatAmount(-1)).toThrowError(RangeError)
		expect(() => formatAmount(-1.2)).toThrowError(RangeError)
	})
})

describe('priceToString', () => {
	it('should format valid prices', () => {
		expect(priceToString(100)).toBe('£1.00')
		expect(priceToString(1000)).toBe('£10.00')
		expect(priceToString(99)).toBe('£0.99')
		expect(priceToString(9999)).toBe('£99.99')
	})

	it('should not format invalid prices', () => {
		expect(() => priceToString(-1)).toThrowError(RangeError)
		expect(() => priceToString(-1.99)).toThrowError(RangeError)
	})
})
