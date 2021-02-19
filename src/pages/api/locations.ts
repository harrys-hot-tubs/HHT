import { NextApiRequest, NextApiResponse } from 'next'
import { RangeRequest, RangeResponse } from '../../typings/api/Locations'
import { LocationDB } from '../../typings/Location'
import { Coordinate } from '../../utils/coordinate'
import db from '../../utils/db'

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	switch (req.method) {
		case 'POST':
			return await post(req, res)
	}
}

const post = async (
	req: NextApiRequest,
	res: NextApiResponse<RangeResponse>
) => {
	const { latitude, longitude } = req.body as RangeRequest
	const userLocation = new Coordinate(latitude, longitude)
	const dispatchers = await db<LocationDB>('locations').select()

	const dispatcherCoordinates = dispatchers.map(locationToCoordinate)
	const inRange = dispatcherCoordinates.some((c) => userLocation.isInRange(c))
	if (inRange) {
		let minDistance = Infinity
		let closest = null

		dispatcherCoordinates.forEach((dispatcher) => {
			const distance = userLocation.distance(dispatcher)
			if (distance < minDistance) {
				minDistance = distance
				closest = dispatchers[dispatcherCoordinates.indexOf(dispatcher)]
			}
		})

		return res.status(200).json({
			inRange: true,
			closest,
		})
	} else {
		return res.status(200).json({
			inRange: false,
		})
	}
}

const locationToCoordinate = (location: LocationDB) =>
	new Coordinate(location.latitude, location.longitude)
