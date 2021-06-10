import wp from '@cypress/webpack-batteries-included-preprocessor'
import { TokenAccount } from '@typings/api/Auth'
import jwt from 'jsonwebtoken'
import accounts from '../fixtures/accounts.json'
import {
	addAccountsToDatabase,
	arbitraryInsert,
	cleanupConnection,
	clearTable,
	seedDatabase,
} from '../helpers/databaseHelper'
import wpConfig from '../webpack.config'

/**
 * @type {Cypress.PluginConfig}
 */
module.exports = (on, config) => {
	on(
		'file:preprocessor',
		wp({
			typescript: require.resolve('typescript'),
			webpackOptions: {
				...wpConfig,
				resolve: {
					extensions: ['.ts', '.tsx', '.js', '.jsx'],
				},
			},
		})
	)
	on('task', {
		async 'defaults:db'() {
			return await seedDatabase()
		},
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
