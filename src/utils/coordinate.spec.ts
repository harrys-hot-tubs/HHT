import {
	bir,
	bp,
	clt,
	cmb,
	crw,
	esb,
	glg,
	shf,
	wlv,
} from '@fixtures/coordinateFixtures'

describe('isInRange', () => {
	it('correctly detects locations in range', () => {
		expect(crw.isInRangeOf(crw)).toBeTruthy()
		expect(wlv.isInRangeOf(bir)).toBeTruthy()
	})

	it('correctly detects locations out of range', () => {
		expect(glg.isInRangeOf(cmb)).toBeFalsy()
		expect(shf.isInRangeOf(clt)).toBeFalsy()
	})
})

describe('distance', () => {
	it('is close to the true distance', () => {
		expect(esb.distanceTo(bp) / 1e3).toBeCloseTo(5566, 0)
		expect(glg.distanceTo(shf) / 1e3).toBeCloseTo(331.9, 0)
		expect(crw.distanceTo(bir) / 1e3).toBeCloseTo(74.48, 0)
	})

	it('calculates distance reversibly', () => {
		expect(esb.distanceTo(bp)).toBe(bp.distanceTo(esb))
		expect(shf.distanceTo(cmb)).toBe(cmb.distanceTo(shf))
	})

	it('gives the distance to the same point to be 0', () => {
		expect(esb.distanceTo(esb)).toBe(0)
		expect(bp.distanceTo(bp)).toBe(0)
	})
})
