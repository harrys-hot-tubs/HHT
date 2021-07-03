import { ConnectedRequest } from '@typings/api'
import { FulfilmentDB, FulfilmentStatus } from '@typings/db/Fulfilment'
import { OrderDB } from '@typings/db/Order'
import db from '@utils/db'
import { getToken, isAuthorised } from '@utils/SSAuth'
import { Knex } from 'knex'
import { NextApiResponse } from 'next'

async function handler(req: ConnectedRequest, res: NextApiResponse) {
	switch (req.method) {
		case 'POST':
			return post(req, res)
		default:
			res.setHeader('Allow', ['POST'])
			res.status(405).end('Method not allowed.')
	}
}

const post = async (
	req: ConnectedRequest<Partial<OrderDB>>,
	res: NextApiResponse
) => {
	const {
		db,
		query: { id },
		body,
	} = req
	const token = getToken(req)
	const status = await isAuthorised(token, ['driver'])
	if (status.authorised) {
		try {
			const updated = await db<OrderDB>('orders')
				.update(body, '*')
				.where('id', '=', id)

			await updateFulfilmentStatus(
				db,
				{ ...body, id: id as string },
				status.payload.account_id
			)
			res.status(200).json({ updated: updated[0] })
		} catch (error) {
			console.error(error.message)
			res.status(400).json(error)
		}
	}
}

const updateFulfilmentStatus = async (
	db: Knex,
	{ id: order_id, fulfilled, returned }: Partial<OrderDB>,
	account_id: number
) => {
	const fulfilmentStatus: FulfilmentStatus =
		returned === true
			? 'returned'
			: fulfilled === true
			? 'delivered'
			: fulfilled === false && returned === false
			? 'undelivered'
			: undefined

	if (!fulfilmentStatus) return null

	return await db<FulfilmentDB>('fulfilments').insert({
		order_id,
		account_id,
		status: fulfilmentStatus,
	})
}

export default db()(handler)
