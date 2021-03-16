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

describe('isInTimeRange', () => {
	it('correctly detects locations in range', () => {
		crw.isInTimeRangeOf(crw).then((res) => expect(res).toBeTruthy())
		wlv.isInTimeRangeOf(bir).then((res) => expect(res).toBeTruthy())
	})

	it('correctly detects locations out of range', () => {
		expect(glg.isInRangeOf(cmb)).toBeFalsy()
		expect(shf.isInRangeOf(clt)).toBeFalsy()
	})
})

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

describe('journeyTime', () => {
	it('calculates journey times greater than 0', () => {
		shf.timeTo(cmb).then((time) => expect(time).toBeGreaterThan(0))
		clt.timeTo(wlv).then((time) => expect(time).toBeGreaterThan(0))
	})

	it('gives the journey time to the same point to be 0', () => {
		esb.timeTo(esb).then((time) => expect(time).toBe(0))
		glg.timeTo(glg).then((time) => expect(time).toBe(0))
	})
})
