import { ConnectedRequest } from '@typings/api/Request'
import { FulfilmentDB } from '@typings/db/Fulfilment'
import db from '@utils/db'
import { NextApiResponse } from 'next'

async function handler(req: ConnectedRequest, res: NextApiResponse) {
	switch (req.method) {
		case 'GET':
			return await get(req, res)
		default:
			res.setHeader('Allow', 'GET')
			res.status(405).end('Method not allowed.')
	}
}

const get = async (
	req: ConnectedRequest,
	res: NextApiResponse<FulfilmentDB[]>
) => {
	try {
		const { db } = req
		const mostRecentFulfilments = await db<FulfilmentDB>({ f1: 'fulfilments' })
			.join(
				db('fulfilments')
					.max('created_at', { as: 'last_update' })
					.groupBy('order_id')
					.as('f2'),
				'f1.created_at',
				'=',
				'f2.last_update'
			)
			.select()
		return res.status(200).json(mostRecentFulfilments)
	} catch (e) {
		return res.status(400).json(e)
	}
}

export default db()(handler)
