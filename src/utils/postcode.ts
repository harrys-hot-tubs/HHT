import { RangeResponse } from '@typings/api/Locations'
import { LocationResponse, ValidationResponse } from '@typings/api/Postcode'
import Coordinate from '@utils/coordinate'
import axios from 'axios'

/**
 * Checks if a postcode is valid, and exists in the UK.
 *
 * @param {string} postcode The postcode to be validated.
 * @returns {Promise<[boolean, string]>} True if the postcode is valid.
 */
export const isPostcode = async (
	postcode: string
): Promise<[boolean, string]> => {
	if (!postcode) return [false, 'Null is not a valid postcode']
	const {
		data: { result: isValid },
	} = await axios.get<ValidationResponse>(
		`https://api.postcodes.io/postcodes/${postcode}/validate`
	)
	if (isValid) return [true, null]
	else return [false, 'Postcode format incorrect.']
}

/**
 * Determines the latitude and longitude of a UK postcode.
 *
 * @param {string} postcode A postcode in the UK.
 * @returns {Coordinate} A coordinate object representing the geographic location of the postcode.
 */
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

/**
 * Determines whether not not a given location can be delivered to by Harry's Hot Tubs.
 *
 * @param {Coordinate} location A geographic location in the UK.
 * @returns {boolean} True if the postcode is in range of one of the delivery venues.
 */
export const isInRange = async (
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

/**
 * Finds the closest delivery venue to a UK postcode.
 *
 * @param {string} postcode A UK postcode.
 * @returns {Promise<number>} The location_id of the nearest delivery venue, or throws an error if the postcode is invalid.
 */
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
