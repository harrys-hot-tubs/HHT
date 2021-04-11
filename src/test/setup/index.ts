import dotenv from 'dotenv'
import path from 'path'
import setupDatabases from './setupDatabases'

/**
 * Loads environment variables and prepares the test databases for the testing process.
 */
export default async () => {
	dotenv.config({ path: path.resolve(__dirname, '../../../.env.test') })
	await setupDatabases()
}
