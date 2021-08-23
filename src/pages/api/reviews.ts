import { ConnectedRequest } from '@typings/api'
import { ReviewDB } from '@typings/db/Review'
import db from '@utils/db'
import { NextApiResponse } from 'next'

async function handler(req: ConnectedRequest, res: NextApiResponse) {
	switch (req.method) {
		case 'GET':
			return get(req, res)
		default:
			res.setHeader('Allow', 'GET')
			res.status(405).end('Method not allowed.')
	}
}

const get = async (req: ConnectedRequest, res: NextApiResponse<ReviewDB[]>) => {
	try {
		const { db } = req
		const reviews = await db<ReviewDB>('reviews').select()
		return res.status(200).json(reviews)
	} catch (error) {
		console.error(error.message)
		return res.status(400).json(error)
	}
}

export default db()(handler)
