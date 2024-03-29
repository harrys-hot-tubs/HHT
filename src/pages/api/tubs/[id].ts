import { ConnectedRequest } from '@typings/api'
import { PriceResponse } from '@typings/api/Payment'
import { LocationDB } from '@typings/db/Location'
import { TubDB } from '@typings/db/Tub'
import db from '@utils/db'
import { differenceInDays } from 'date-fns'
import { Knex } from 'knex'
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
		console.error(error.message)
		return res.status(400).json(error)
	}
}

const post = async (
	req: ConnectedRequest<{ startDate: string; endDate: string }>,
	res: NextApiResponse<PriceResponse>
) => {
	const {
		query: { id },
		body: { startDate, endDate },
		db,
	} = req
	try {
		const tubID = Number(id as string)
		const parsedStartDate = new Date(startDate)
		const parsedEndDate = new Date(endDate)

		const price = await calculateHirePrice(
			{
				tubID,
				startDate: parsedStartDate,
				endDate: parsedEndDate,
			},
			db
		)
		return res.status(200).json({ price })
	} catch (error) {
		console.error(error.message)
		return res.status(400).json(error)
	}
}

/**
 * Calculates the price (in pounds) of hiring a hot tub for a specific duration.
 *
 * @param tubInfo Information about the tub to have its price calculated.
 * @param db Database instance.
 * @returns The price of hiring the tub for the duration specified in pounds.
 */
export const calculateHirePrice = async (
	{
		tubID,
		startDate,
		endDate,
	}: {
		tubID: number
		startDate: Date
		endDate: Date
	},
	db: Knex
): Promise<number> => {
	const nights = differenceInDays(endDate, startDate)

	if (nights > 7 || nights < 2) throw new RangeError('Duration is invalid.')

	const location = await db<LocationDB>('locations')
		.select('initial_price', 'night_price')
		.first()
		.join('tubs', 'tubs.location_id', '=', 'locations.location_id')
		.where('tubs.tub_id', '=', tubID)

	if (!location) throw new ReferenceError('Location of tub not found.')

	const { initial_price, night_price } = location

	const finalPrice = Number(initial_price) + (nights - 2) * Number(night_price)
	return finalPrice
}

export default db()(handler)
