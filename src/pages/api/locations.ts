import { RangeRequest, RangeResponse } from '@typings/api/Locations'
import { ConnectedRequest } from '@typings/api/Request'
import { LocationDB } from '@typings/db/Location'
import Coordinate from '@utils/coordinate'
import db from '@utils/db'
import { NextApiResponse } from 'next'

async function handler(req: ConnectedRequest, res: NextApiResponse) {
	switch (req.method) {
		case 'GET':
			return await get(req, res)
		case 'POST':
			return await post(req, res)
		default:
			res.setHeader('Allow', ['GET', 'POST'])
			res.status(405).end('Method not allowed.')
	}
}

const get = async (
	req: ConnectedRequest,
	res: NextApiResponse<LocationDB[]>
) => {
	const { db } = req
	try {
		const locations: LocationDB[] = await db('locations').select()
		const parsedLocations = locations.map((loc) => ({
			...loc,
			initial_price: Number(loc.initial_price),
			night_price: Number(loc.night_price),
		}))

		res.status(200).json(parsedLocations)
	} catch (error) {
		console.error(error)
		res.status(500).end()
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

	const dispatcherCoordinates: Coordinate[] =
		dispatchers.map(locationToCoordinate)
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

/**
 * Transforms a location object from the database into a Coordinate object.
 * @param location A location stored in the database.
 * @returns A coordinate object representing the geographic position of the location object.
 */
const locationToCoordinate = (location: LocationDB) =>
	new Coordinate(location.latitude, location.longitude)

export default db()(handler)
