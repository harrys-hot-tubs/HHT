import { ConnectedRequest } from '@typings/api'
import { TubDB } from '@typings/db/Tub'
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

const get = async (req: ConnectedRequest, res: NextApiResponse<TubDB[]>) => {
	try {
		const { db } = req
		const tubs = await db<TubDB>('tubs').select()
		return res.status(200).json(tubs)
	} catch (error) {
		console.error(error.message)
		return res.status(400).json(error)
	}
}

export default db()(handler)
