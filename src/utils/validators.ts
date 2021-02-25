import { getCoordinates, getInRange, isPostcode } from '@utils/postcode'

export const validatePostcode = async (
	postcode: string
): Promise<[boolean, string]> => {
	try {
		if (!postcode) throw new Error('Postcode required.')

		const [valid, formatError] = await isPostcode(postcode)
		if (formatError) throw new Error(formatError)

		const location = await getCoordinates(postcode)

		const [inRange, rangeError] = await getInRange(location)
		if (rangeError) throw new Error(rangeError)

		return [valid && inRange, null]
	} catch (e) {
		return [false, e.message]
	}
}
