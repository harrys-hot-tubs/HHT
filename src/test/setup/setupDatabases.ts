import Knex from 'knex'

export default async () => {
	const connection = Knex({
		client: 'pg',
		connection: {
			host: process.env.AWS_DB_ENDPOINT,
			user: process.env.AWS_DB_USER,
			password: process.env.AWS_DB_PASSWORD,
			database: process.env.AWS_DB,
		},
	})

	const dbName = process.env.AWS_DB
	const workers = parseInt(process.env.JEST_WORKERS || '1')
	for (let i = 0; i < workers; i++) {
		const workerDB = `test_${i}`

		await connection.raw(`DROP DATABASE IF EXISTS ${workerDB}`)
		await connection.raw(`CREATE DATABASE ${workerDB} TEMPLATE ${dbName}`)
	}

	await connection.destroy()
}
