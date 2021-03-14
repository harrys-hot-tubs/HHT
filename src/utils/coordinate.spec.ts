import {
	BIR,
	BP,
	CLT,
	CMB,
	CRW,
	ESB,
	GLG,
	SHF,
	WLV,
} from '@test/fixtures/coordinateFixtures'

describe('isInTimeRange', () => {
	it('correctly detects locations in range', () => {
		CRW.isInTimeRangeOf(CRW).then((res) => expect(res).toBeTruthy())
		WLV.isInTimeRangeOf(BIR).then((res) => expect(res).toBeTruthy())
	})

	it('correctly detects locations out of range', () => {
		expect(GLG.isInRangeOf(CMB)).toBeFalsy()
		expect(SHF.isInRangeOf(CLT)).toBeFalsy()
	})
})

describe('isInRange', () => {
	it('correctly detects locations in range', () => {
		expect(CRW.isInRangeOf(CRW)).toBeTruthy()
		expect(WLV.isInRangeOf(BIR)).toBeTruthy()
	})

	it('correctly detects locations out of range', () => {
		expect(GLG.isInRangeOf(CMB)).toBeFalsy()
		expect(SHF.isInRangeOf(CLT)).toBeFalsy()
	})
})

describe('distance', () => {
	it('is close to the true distance', () => {
		expect(ESB.distanceTo(BP) / 1e3).toBeCloseTo(5566, 0)
		expect(GLG.distanceTo(SHF) / 1e3).toBeCloseTo(331.9, 0)
		expect(CRW.distanceTo(BIR) / 1e3).toBeCloseTo(74.48, 0)
	})

	it('calculates distance reversibly', () => {
		expect(ESB.distanceTo(BP)).toBe(BP.distanceTo(ESB))
		expect(SHF.distanceTo(CMB)).toBe(CMB.distanceTo(SHF))
	})

	it('gives the distance to the same point to be 0', () => {
		expect(ESB.distanceTo(ESB)).toBe(0)
		expect(BP.distanceTo(BP)).toBe(0)
	})
})

describe('journeyTime', () => {
	it('calculates journey times greater than 0', () => {
		SHF.timeTo(CMB).then((time) => expect(time).toBeGreaterThan(0))
		CLT.timeTo(WLV).then((time) => expect(time).toBeGreaterThan(0))
	})

	it('gives the journey time to the same point to be 0', () => {
		ESB.timeTo(ESB).then((time) => expect(time).toBe(0))
		GLG.timeTo(GLG).then((time) => expect(time).toBe(0))
	})
})
