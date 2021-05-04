import { Client } from '@googlemaps/google-maps-services-js'

export default class Coordinate {
	/**
	 * Radius of the Earth in km.
	 */
	static R = 6371e3
	static client = new Client({})
	public latitude: number
	public longitude: number

	constructor(latitude: number, longitude: number) {
		this.latitude = latitude
		this.longitude = longitude
	}

	/**
	 * Determines whether or not two coordinates are within 90 minutes of each other.
	 * @param c The coordinate to be assessed.
	 * @returns True if the coordinates are within 90 minutes of each other.
	 */
	async isInTimeRangeOf(c: Coordinate) {
		if (this.isInRangeOf(c)) {
			return true
		} else {
			return (await this.timeTo(c)) < 90
		}
	}

	/**
	 * Calculates whether or not two coordinates are within 30 miles.
	 * @deprecated Superseded by isInTimeRangeOf
	 * @param c The coordinate to be assessed.
	 * @returns True if the coordinates are within 30 miles of each other.
	 */
	isInRangeOf(c: Coordinate) {
		return this.distanceTo(c) < 30 * 1609.334
	}

	/**
	 * Calculates the distance between this and another point using the
	 * {@link https://en.wikipedia.org/wiki/Haversine_formula, Haversine Formula}.
	 *
	 * @deprecated Superseded by timeTo
	 * @param location The coordinate to be compared.
	 * @returns The distance between the two coordinates in m.
	 */
	distanceTo(location: Coordinate) {
		if (this === location) return 0

		const lat1 = this.latitude
		const long1 = this.longitude
		const { latitude: lat2, longitude: long2 } = location
		const theta1 = this.toRads(lat1)
		const theta2 = this.toRads(lat2)
		const delta_theta = theta2 - theta1
		const lambda1 = this.toRads(long1)
		const lambda2 = this.toRads(long2)
		const delta_lambda = lambda2 - lambda1

		const a =
			Math.sin(delta_theta / 2) * Math.sin(delta_theta / 2) +
			Math.cos(theta1) *
				Math.cos(theta2) *
				Math.sin(delta_lambda / 2) *
				Math.sin(delta_lambda / 2)

		const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
		const d = Coordinate.R * c

		return d
	}

	/**
	 * Calculates the journey time in minutes from this to another location.
	 * @param location The coordinate to be compared.
	 */
	async timeTo(location: Coordinate) {
		if (this == location) return 0
		try {
			const response = await Coordinate.client.distancematrix({
				params: {
					origins: [{ lat: location.latitude, lng: location.longitude }],
					destinations: [{ lat: this.latitude, lng: this.longitude }],
					key: process.env.GC_API_KEY,
					language: 'en-GB',
				},
			})
			return Number(response.data.rows[0].elements[0].duration.value) / 60
		} catch (e) {
			return Infinity
		}
	}

	/**
	 * Changes the format of a given angle from degrees to radians.
	 * @param x An angle in degrees.
	 * @returns x in radians.
	 */
	private toRads(x: number) {
		return (x * Math.PI) / 180
	}
}
