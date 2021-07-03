import { ConnectedRequest } from '@typings/api'
import { RefundDB } from '@typings/db/Refund'
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

const get = async (req: ConnectedRequest, res: NextApiResponse<RefundDB[]>) => {
	try {
		const { db } = req
		const refunds = await db<RefundDB>('refunds').select()
		return res.status(200).json(refunds)
	} catch (error) {
		console.error(error.message)
		return res.status(400).json(error)
	}
}

export default db()(handler)
