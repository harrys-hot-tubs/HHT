import jwt from 'jsonwebtoken'
import account from '../fixtures/account.json'
import {
	addAccountToDatabase,
	arbitraryInsert,
	cleanupConnection,
} from '../helpers/databaseHelper'

module.exports = (on, config) => {
	on('task', {
		async DBInsert({ tableName, data }) {
			return await arbitraryInsert(tableName, data)
		},
		async addAccount() {
			return await addAccountToDatabase()
		},
		async cleanup() {
			return await cleanupConnection()
		},
		generateToken() {
			return new Promise((resolve, reject) => {
				try {
					const token = jwt.sign(
						{
							first_name: account.first_name,
							last_name: account.last_name,
							account_roles: account.account_roles,
						},
						process.env.TOKEN_SECRET,
						{
							expiresIn: '1h',
						}
					)
					resolve(token)
				} catch (error) {
					reject(error)
				}
			})
		},
	})
}
