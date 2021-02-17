import { NextApiRequest, NextApiResponse } from 'next'
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
	res: NextApiResponse<{ result: { inRange: boolean } }>
) => {
	const { latitude, longitude } = req.body
	const userLocation = new Coordinate(latitude, longitude)
	const dispatchers = await db<LocationDB>('locations').select()

	const dispatcherCoordinates = dispatchers.map(locationToCoordinate)
	const inRange = dispatcherCoordinates.some((c) => userLocation.isInRange(c))
	res.status(200).json({
		result: {
			inRange,
		},
	})
}

const locationToCoordinate = (location: LocationDB) =>
	new Coordinate(location.latitude, location.longitude)
