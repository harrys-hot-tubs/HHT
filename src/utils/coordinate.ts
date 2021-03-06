export class Coordinate {
	static R = 6371e3
	public latitude: number
	public longitude: number

	constructor(latitude: number, longitude: number) {
		this.latitude = latitude
		this.longitude = longitude
	}

	isInRange(c: Coordinate) {
		return this.distance(c) < 30 * 1609.334
	}

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

	private toRads(x: number) {
		return (x * Math.PI) / 180
	}
}
