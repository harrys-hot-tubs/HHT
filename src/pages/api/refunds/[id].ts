import { ConnectedRequest } from '@typings/api/Request'
import { RefundDB } from '@typings/db/Refund'
import db from '@utils/db'
import { getToken, isAuthorised } from '@utils/SSAuth'
import { NextApiResponse } from 'next'

async function handler(req: ConnectedRequest, res: NextApiResponse) {
	switch (req.method) {
		case 'POST':
			return await post(req, res)
		case 'DELETE':
			return await remove(req, res)
		default:
			res.setHeader('Allow', ['POST', 'DELETE'])
			res.status(405).end('Method not allowed.')
	}
}

const post = async (req: ConnectedRequest, res: NextApiResponse) => {
	const {
		db,
		query: { id },
	} = req
	const token = getToken(req)
	const status = await isAuthorised(token, ['driver'])
	if (status.authorised) {
		const refundDetails: Omit<RefundDB, 'account_id' | 'order_id'> = req.body
		const driver_id = status.payload.account_id
		try {
			const inserted = await db<RefundDB>('refunds').insert(
				{
					order_id: id as string,
					damaged: refundDetails.damaged,
					damage_information: refundDetails.damage_information,
					account_id: driver_id,
				},
				'*'
			)
			return res.status(200).json({ inserted: inserted[0] })
		} catch (e) {
			res.status(500).json(e)
		}
	}
	res.status(400).end()
}

const remove = async (req: ConnectedRequest, res: NextApiResponse) => {
	const {
		db,
		query: { id },
	} = req
	const token = getToken(req)
	const status = await isAuthorised(token, ['driver'])
	if (status.authorised) {
		try {
			const removed = await db<RefundDB>('refunds')
				.del('*')
				.where('order_id', '=', id)
			return res.status(200).json({ removed })
		} catch (e) {
			res.status(500).json(e)
		}
	}
	res.status(400).end()
}

export default db()(handler)
