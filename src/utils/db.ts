import knex from 'knex'

const db = knex({
	client: 'pg',
	connection: process.env.DB_HOST,
})

export default db
