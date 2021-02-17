import axios from 'axios'
import { Coordinate } from './coordinate'

interface ValidationResponse {
	status: number
	result: boolean
}

interface LocationResponse {
	result: {
		latitude: number
		longitude: number
	}
}

interface RangeResponse {
	result: {
		inRange: boolean
	}
}

export const validatePostcode = async (
	postcode: string
): Promise<[boolean, string]> => {
	try {
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

const isPostcode = async (postcode: string): Promise<[boolean, string]> => {
	const {
		data: { result: isValid },
	} = await axios.get<ValidationResponse>(
		`https://api.postcodes.io/postcodes/${postcode}/validate`
	)
	if (isValid) return [true, null]
	else return [false, 'Postcode format incorrect.']
}

const getCoordinates = async (postcode: string): Promise<Coordinate> => {
	const {
		data: {
			result: { latitude, longitude },
		},
	} = await axios.get<LocationResponse>(
		`https://api.postcodes.io/postcodes/${postcode}`
	)
	return new Coordinate(latitude, longitude)
}

const getInRange = async (location: Coordinate): Promise<[boolean, string]> => {
	const {
		data: {
			result: { inRange },
		},
	} = await axios.post<RangeResponse>('/api/range', {
		latitude: location.latitude,
		longitude: location.longitude,
	})
	if (inRange) return [true, null]
	else return [false, 'Delivery is not available in your area.']
}
