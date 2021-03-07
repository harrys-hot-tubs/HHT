import { Client } from '@googlemaps/google-maps-services-js'

export class Coordinate {
	static R = 6371e3
	static client = new Client({})
	public latitude: number
	public longitude: number

	constructor(latitude: number, longitude: number) {
		this.latitude = latitude
		this.longitude = longitude
	}

	async isInTimeRange(c: Coordinate) {
		return (await this.isInTimeRange(c)) < 90
	}

	/**
	 * Calculates whether or not two coordinates are within 30 miles.
	 * @deprecated
	 * @param c The coordinate to be assessed.
	 * @returns Whether or not the coordinates are within 30 miles of each other.
	 */
	isInRange(c: Coordinate) {
		return this.distance(c) < 30 * 1609.334
	}

	/**
	 * Calculates the distance between this and another point using the
	 * {@link https://en.wikipedia.org/wiki/Haversine_formula, Haversine Formula}.
	 *
	 * @deprecated
	 * @param location The coordinate to be compared.
	 * @returns The distance between the two coordinates in m.
	 */
	distance(location: Coordinate) {
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

		const c = 2 * Math.atan(Math.sqrt(a))
		const d = Coordinate.R * c

		return d
	}

	/**
	 * Calculates the journey time in minutes from this to another location.
	 * @param location The coordinate to be compared.
	 */
	async journeyTime(location: Coordinate) {
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
			console.error(e.message)
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
