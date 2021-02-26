import { getCoordinates, getInRange, isPostcode } from '@utils/postcode'

export type PostcodeError = 'missing' | 'format' | 'range' | 'other'

export const validatePostcode = async (
	postcode: string
): Promise<[boolean, PostcodeError]> => {
	try {
		if (!postcode) return [false, 'missing']

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
