require('dotenv').config({ path: '.env.test' })
import { cleanupDatabase } from '@helpers/DBHelper'
import { AccountDB } from '@typings/db/Account'
import { connector } from '@utils/db'
import { forEachAsync } from '@utils/index'
import bcrypt from 'bcrypt'
import accounts from '../fixtures/accounts.json'

export const PASSWORD = 'password'
const SALT_ROUNDS = 10
let connection = connector()()

export const arbitraryInsert = async (tableName: string, data: any[]) => {
	return await connection(tableName).insert(data)
}

export const clearTable = async (tableName: string) => {
	return await connection(tableName).del()
}

export const addAccountsToDatabase = async () => {
	await forEachAsync(accounts, async (account) => {
		const password_hash = await bcrypt.hash(PASSWORD, SALT_ROUNDS)
		const completeAccount: AccountDB = {
			...account,
			password_hash,
		} as AccountDB
		await arbitraryInsert('accounts', [completeAccount])
	})
	return null
}

export const cleanupConnection = async () => {
	await cleanupDatabase(connection)
	connection = connector()()
	return null
}
