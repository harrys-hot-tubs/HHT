import { RangeRequest, RangeResponse } from '@typings/api/Locations'
import { ConnectedRequest } from '@typings/api/Request'
import { LocationDB } from '@typings/Location'
import { Coordinate } from '@utils/coordinate'
import db from '@utils/db'
import { NextApiResponse } from 'next'

async function handler(req: ConnectedRequest, res: NextApiResponse) {
	switch (req.method) {
		case 'POST':
			return await post(req, res)
		default:
			res.setHeader('Allow', 'POST')
			res.status(405).end('Method not allowed.')
	}
}

const post = async (
	req: ConnectedRequest,
	res: NextApiResponse<RangeResponse>
) => {
	const { db } = req
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

export default db()(handler)
