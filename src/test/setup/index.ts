import dotenv from 'dotenv'
import path from 'path'
import setupDatabases from './setupDatabases'

export default async () => {
	dotenv.config({ path: path.resolve(__dirname, '../../../.env.test') })
	await setupDatabases()
}
