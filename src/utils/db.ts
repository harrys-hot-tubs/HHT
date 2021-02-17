import knex from 'knex'

let cachedConnection: knex

const db = <T>(table: string) => {
	if (cachedConnection) return cachedConnection<T>(table)

	const connection = knex({
		client: 'pg',
		connection: process.env.DB_HOST,
	})
	cachedConnection = connection
	return cachedConnection<T>(table)
}

export default db
