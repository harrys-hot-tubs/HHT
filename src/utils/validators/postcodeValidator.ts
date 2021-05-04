import blockedOutcodes from '@json/blockedOutcodes.json'
import { getCoordinates, isInRange, isPostcode } from '@utils/postcode'

export type PostcodeError =
	| 'missing'
	| 'format'
	| 'range'
	| 'other'
	| 'blocked'
	| 'insurance'

const validatePostcode = async (
	postcode: string
): Promise<[boolean, PostcodeError]> => {
	try {
		if (!postcode) return [false, 'missing']

		if (isBlocked(postcode)) return [false, 'blocked']

		const [valid, formatError] = await isPostcode(postcode)
		if (formatError) return [false, 'format']

		const location = await getCoordinates(postcode)

		const [inRange, rangeError] = await isInRange(location)
		if (rangeError) return [false, 'range']

		if (valid && inRange && requiresImage(postcode)) return [true, 'insurance']

		return [valid && inRange, null]
	} catch (e) {
		console.error(e.message)
		return [false, 'other']
	}
}

const requiresImage = (postcode: string) => {
	return postcode.toUpperCase().startsWith('LS6')
}

const isBlocked = (postcode: string, blocked: string[] = blockedOutcodes) => {
	const formattedPostcode = postcode.toUpperCase()
	return blocked.some((outcode) => {
		return formattedPostcode.startsWith(outcode)
	})
}

export default validatePostcode
