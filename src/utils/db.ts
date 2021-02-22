import knex from 'knex'
import { NextApiResponse } from 'next'
import { ConnectedRequest } from '../typings/api/Request'

let connection: knex

export const connector = () => {
	return () => {
		connection = knex({
			client: 'pg',
			connection: {
				host: process.env.AWS_DB_ENDPOINT,
				user: process.env.AWS_DB_USER,
				password: process.env.AWS_DB_PASSWORD,
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
