import { TokenAccount } from '@typings/api/Auth'
import jwt from 'jsonwebtoken'
import accounts from '../fixtures/accounts.json'
import {
	addAccountsToDatabase,
	arbitraryInsert,
	cleanupConnection,
	clearTable,
} from '../helpers/databaseHelper'

module.exports = (on, config) => {
	on('task', {
		async DBClear({ tableName }: { tableName: string }) {
			return await clearTable(tableName)
		},
		async DBInsert({ tableName, data }: { tableName: string; data: any[] }) {
			return await arbitraryInsert(tableName, data)
		},
		async addAccounts() {
			return await addAccountsToDatabase()
		},
		async cleanup() {
			return await cleanupConnection()
		},
		generateToken({ index }: { index: number }) {
			return new Promise((resolve, reject) => {
				try {
					const tokenised: TokenAccount = {
						account_id: accounts[index].account_id,
					}
					const token = jwt.sign(tokenised, process.env.TOKEN_SECRET, {
						expiresIn: '1h',
					})
					resolve(token)
				} catch (error) {
					reject(error)
				}
			})
		},
	})
}
