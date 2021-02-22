import { TubDB } from '@typings/Tub'
import { NextApiResponse } from 'next'
import { ConnectedRequest } from '../../../typings/api/Request'
import db from '../../../utils/db'

async function handler(req: ConnectedRequest, res: NextApiResponse) {
	switch (req.method) {
		case 'GET':
			return await get(req, res)
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
	} catch (e) {
		return res.status(400).json(e)
	}
}

export default db(handler)
