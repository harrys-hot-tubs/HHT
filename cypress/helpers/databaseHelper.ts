require('dotenv').config({ path: '.env.test' })
// TODO figure out why this breaks in CI.
import { cleanupDatabase, connection } from '@helpers/DBHelper'
import { AccountDB } from '@typings/db/Account'
import bcrypt from 'bcrypt'
import partialAccount from '../fixtures/account.json'

export const PASSWORD = 'password'
const SALT_ROUNDS = 10

export const addAccountToDatabase = async () => {
	const password_hash = await bcrypt.hash(PASSWORD, SALT_ROUNDS)
	const completeAccount: AccountDB = {
		...partialAccount,
		password_hash,
	} as AccountDB
	await connection<AccountDB>('accounts').insert(completeAccount)
	return null
}

export const cleanupConnection = async () => {
	await cleanupDatabase(connection)
	return null
}
