import { PriceResponse } from '@typings/api/Checkout'
import { ConnectedRequest } from '@typings/api/Request'
import { LocationDB } from '@typings/Location'
import { TubDB } from '@typings/Tub'
import { stringToMoment } from '@utils/date'
import db from '@utils/db'
import { Knex } from 'knex'
import moment from 'moment'
import { NextApiResponse } from 'next'

async function handler(req: ConnectedRequest, res: NextApiResponse) {
	switch (req.method) {
		case 'GET':
			return get(req, res)
		case 'POST':
			return post(req, res)
		default:
			res.setHeader('Allow', ['GET', 'POST'])
			res.status(405).end('Method not allowed.')
	}
}

const get = async (req: ConnectedRequest, res: NextApiResponse<TubDB>) => {
	const {
		query: { id },
	} = req
	try {
		const tub = await req
			.db<TubDB>('tubs')
			.select()
			.where('tub_id', '=', id)
			.first()

		if (!tub) throw new Error(`Tub with id ${id} doesn't exist`)
		return res.status(200).json(tub)
	} catch (error) {
		return res.status(400).json(error)
	}
}

const post = async (
	req: ConnectedRequest,
	res: NextApiResponse<PriceResponse>
) => {
	const {
		query: { id },
		body: { startDate, endDate },
		db,
	} = req
	try {
		const tubID = Number(id as string)
		const parsedStartDate = stringToMoment(startDate)
		const parsedEndDate = stringToMoment(endDate)

		const price = await getPrice({
			tubID,
			startDate: parsedStartDate,
			endDate: parsedEndDate,
			db,
		})
		return res.status(200).json({ price })
	} catch (error) {
		return res.status(400).json(error)
	}
}

const getPrice = async ({
	tubID,
	startDate,
	endDate,
	db,
}: {
	tubID: number
	startDate: moment.Moment
	endDate: moment.Moment
	db: Knex
}): Promise<number> => {
	const booking_duration = moment.duration(endDate.diff(startDate))
	const nights = booking_duration.days()

	if (nights > 7 || nights < 2) throw new Error('Duration is invalid.')

	const { initial_price, night_price } = await db<LocationDB>('locations')
		.select('initial_price', 'night_price')
		.first()
		.join('tubs', 'tubs.location_id', '=', 'locations.location_id')
		.where('tubs.tub_id', '=', tubID)

	const finalPrice = Number(initial_price) + (nights - 2) * Number(night_price)
	return finalPrice
}

export default db()(handler)
