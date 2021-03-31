import { getCoordinates, getInRange, isPostcode } from '@utils/postcode'

export type PostcodeError = 'missing' | 'format' | 'range' | 'other' | 'blocked'

const validatePostcode = async (
	postcode: string
): Promise<[boolean, PostcodeError]> => {
	try {
		if (!postcode) return [false, 'missing']

		if (isBlocked(postcode)) return [false, 'blocked']

		const [valid, formatError] = await isPostcode(postcode)
		if (formatError) return [false, 'format']

		const location = await getCoordinates(postcode)

		const [inRange, rangeError] = await getInRange(location)
		if (rangeError) return [false, 'range']

		return [valid && inRange, null]
	} catch (e) {
		console.error(e.message)
		return [false, 'other']
	}
}

const isBlocked = (postcode: string, blocked: string[] = blockedOutcodes) => {
	const formattedPostcode = postcode.toUpperCase()
	return blocked.some((outcode) => {
		return formattedPostcode.startsWith(outcode)
	})
}

export const blockedOutcodes = [
	'EC',
	'SE1',
	'WC',
	'NW',
	'N1',
	'N2',
	'N3',
	'N4',
	'N5',
	'N6',
	'N7',
	'N8',
	'N9',
	'N10',
	'N11',
	'N12',
	'N13',
	'N14',
	'N15',
	'N16',
	'N17',
	'N18',
	'N19',
	'N20',
	'N21',
	'N22',
	'E1',
	'E2',
	'E3',
	'E4',
	'E5',
	'E6',
	'E7',
	'E8',
	'E9',
	'E10',
	'E11',
	'E12',
	'E13',
	'E14',
	'E15',
	'E16',
	'E17',
	'E18',
]

export default validatePostcode
