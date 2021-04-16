import { ConnectedRequest } from '@typings/api/Request'
import { OrderDB } from '@typings/db/Order'
import db from '@utils/db'
import { NextApiResponse } from 'next'

async function handler(req: ConnectedRequest, res: NextApiResponse) {
	switch (req.method) {
		case 'POST':
			return await post(req, res)
		default:
			res.setHeader('Allow', ['POST'])
			res.status(405).end('Method not allowed.')
	}
}

const post = async (req: ConnectedRequest, res: NextApiResponse) => {
	const {
		db,
		query: { id },
	} = req
	const orderDetails: Partial<OrderDB> = req.body
	try {
		const updated = await db<OrderDB>('orders')
			.update(orderDetails, '*')
			.where('id', '=', id)
		res.status(200).json({ updated })
	} catch (e) {
		res.status(400).json(e)
	}
}

export default db()(handler)
