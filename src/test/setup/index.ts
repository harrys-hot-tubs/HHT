import dotenv from 'dotenv'
import path from 'path'
import setupDatabases from './setupDatabases'

export default async () => {
	console.log(`process.env.JEST_WORKERS`, process.env.JEST_WORKERS)
	dotenv.config({ path: path.resolve(__dirname, '../../../.env.test') })
	await setupDatabases()
}
