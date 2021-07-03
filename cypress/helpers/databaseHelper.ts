require('dotenv').config({ path: '.env.test' })
import { bookings } from '@fixtures/bookingFixtures'
import { locations } from '@fixtures/locationFixtures'
import { storedOrder } from '@fixtures/orderFixtures'
import { tubs } from '@fixtures/tubFixtures'
import { cleanupDatabase } from '@helpers/DBHelper'
import { AccountDB } from '@typings/db/Account'
import { connector } from '@utils/db'
import { forEachAsync } from '@utils/index'
import bcrypt from 'bcryptjs'
import accounts from '../fixtures/accounts.json'

export const PASSWORD = 'password'
const SALT_ROUNDS = 10
let connection = connector()()

export const seedDatabase = async () => {
	try {
		await addAccountsToDatabase()
		await arbitraryInsert('locations', locations)
		await arbitraryInsert('staff', [
			{
				account_id: accounts[1].account_id,
				location_id: locations[0].location_id,
			},
		])
		await arbitraryInsert('tubs', tubs)
		await arbitraryInsert('bookings', [bookings[0]])
		await arbitraryInsert('orders', [storedOrder])
		return true
	} catch (error) {
		console.error(error.message)
		return error
	}
}

export const arbitraryInsert = async (tableName: string, data: any[]) => {
	return connection(tableName).insert(data)
}

export const clearTable = async (tableName: string) => {
	return connection(tableName).del('*')
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
