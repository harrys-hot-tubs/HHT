import { ConnectedRequest } from '@typings/api'
import knex, { Knex } from 'knex'
import { NextApiResponse } from 'next'

let connection: Knex

/**
 * Higher order function that allows a function to be executed with a connection to the database.
 * @returns A Knex object.
 */
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

/**
 * Higher-order function for wrapping API route handlers to provide them with a database connection.
 */
const db = (...args: any[]) => {
	return (fn: Function) =>
		async (req: ConnectedRequest, res: NextApiResponse) => {
			req.db = connector()()
			await fn(req, res)
			await req.db.destroy()
			return
		}
}

export default db
