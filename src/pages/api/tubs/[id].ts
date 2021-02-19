import { NextApiRequest, NextApiResponse } from 'next'
import { TubDB } from '../../../typings/Tub'
import db from '../../../utils/db'

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	switch (req.method) {
		case 'GET':
			return await get(req, res)
	}
}

const get = async (req: NextApiRequest, res: NextApiResponse<TubDB>) => {
	const {
		query: { id },
	} = req
	try {
		const tub = await db<TubDB>('tubs')
			.select()
			.first()
			.where('tub_id', '=', id)
		return res.status(200).json(tub)
	} catch (e) {
		return res.status(400).json(e)
	}
}
