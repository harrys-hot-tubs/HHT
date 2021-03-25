import { ConnectedRequest } from '@typings/api/Request'
import knex, { Knex } from 'knex'
import { NextApiResponse } from 'next'

let connection: Knex

export const connector = () => {
	return () => {
		connection = knex({
			client: 'pg',
			connection: {
				host: process.env.AWS_DB_ENDPOINT,
				user: process.env.AWS_DB_USER,
				password: process.env.AWS_DB_PASSWORD,
				database:
					process.env.NODE_ENV === 'test'
						? `test_${process.env.JEST_WORKER_ID || '1'}`
						: process.env.AWS_DB,
			},
		})

		return connection
	}
}

const db = (...args: any[]) => {
	return (fn: Function) => async (
		req: ConnectedRequest,
		res: NextApiResponse
	) => {
		req.db = connector()()
		await fn(req, res)
		await req.db.destroy()
		return
	}
}

export default db
