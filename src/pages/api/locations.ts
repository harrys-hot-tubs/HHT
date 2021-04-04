import { RangeRequest, RangeResponse } from '@typings/api/Locations'
import { ConnectedRequest } from '@typings/api/Request'
import { LocationDB } from '@typings/db/Location'
import Coordinate from '@utils/coordinate'
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

	const dispatcherCoordinates: Coordinate[] = dispatchers.map(
		locationToCoordinate
	)
	const ranges = await Promise.all(
		dispatcherCoordinates.map((location) => userLocation.timeTo(location))
	)

	const inRange = ranges.some((r) => r < 90)
	if (inRange) {
		let minDuration = Infinity
		let closest = null

		ranges.forEach((range) => {
			if (range < minDuration) {
				minDuration = range
				closest = dispatchers[ranges.indexOf(range)]
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
