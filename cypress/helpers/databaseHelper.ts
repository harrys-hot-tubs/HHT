require('dotenv').config({ path: '.env.test' })
import { cleanupDatabase, connection } from '@helpers/DBHelper'
import { AccountDB } from '@typings/db/Account'
import bcrypt from 'bcrypt'
import partialAccount from '../fixtures/account.json'

export const PASSWORD = 'password'
const SALT_ROUNDS = 10

export const arbitraryInsert = async (tableName: string, data: any) => {
	return await connection(tableName).insert(data)
}

export const addAccountToDatabase = async () => {
	const password_hash = await bcrypt.hash(PASSWORD, SALT_ROUNDS)
	const completeAccount: AccountDB = {
		...partialAccount,
		password_hash,
	} as AccountDB
	return await arbitraryInsert('accounts', completeAccount)
}

export const cleanupConnection = async () => {
	await cleanupDatabase(connection)
	return null
}
