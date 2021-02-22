import { RangeResponse } from '@typings/api/Locations'
import { Coordinate } from '@utils/coordinate'
import axios from 'axios'

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

export const isPostcode = async (
	postcode: string
): Promise<[boolean, string]> => {
	const {
		data: { result: isValid },
	} = await axios.get<ValidationResponse>(
		`https://api.postcodes.io/postcodes/${postcode}/validate`
	)
	if (isValid) return [true, null]
	else return [false, 'Postcode format incorrect.']
}

export const getCoordinates = async (postcode: string): Promise<Coordinate> => {
	const {
		data: {
			result: { latitude, longitude },
		},
	} = await axios.get<LocationResponse>(
		`https://api.postcodes.io/postcodes/${postcode}`
	)
	return new Coordinate(latitude, longitude)
}

export const getInRange = async (
	location: Coordinate
): Promise<[boolean, string]> => {
	const {
		data: { inRange },
	} = await axios.post<RangeResponse>('/api/locations', {
		latitude: location.latitude,
		longitude: location.longitude,
	})
	if (inRange) return [true, null]
	else return [false, 'Delivery is not available in your area.']
}

export const getClosestDispatcher = async (
	postcode: string
): Promise<number> => {
	const { latitude, longitude } = await getCoordinates(postcode)
	const { data } = await axios.post<RangeResponse>('/api/locations', {
		latitude: latitude,
		longitude: longitude,
	})
	if (data.inRange) return data.closest.location_id
	else throw new Error('Postcode is invalid.')
}
