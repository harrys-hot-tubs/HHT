import injectDevServer from '@cypress/react/plugins/next'
import wp from '@cypress/webpack-batteries-included-preprocessor'
import { TokenAccount } from '@typings/api/Auth'
import { addHours } from 'date-fns'
import jwt from 'jsonwebtoken'
import accounts from '../fixtures/accounts.json'
import {
	addAccountsToDatabase,
	arbitraryInsert,
	cleanupConnection,
	clearTable,
	seedDatabase,
} from '../helpers/databaseHelper'
import { setStorage } from '../helpers/localStorageHelper'
import wpConfig from '../webpack.config'

/**
 * @type {Cypress.PluginConfig}
 */
module.exports = (on, config) => {
	on('before:browser:launch', (browser, launchOptions) => {
		if (browser.name === 'chrome') {
			launchOptions.args.push('--lang=en-GB')
			return launchOptions
		}
	})
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
		GiveConsent() {
			return new Promise((resolve, _reject) => {
				setStorage({
					consent: JSON.stringify({
						value: 'true',
						exp: addHours(new Date(), 2).getTime(),
					}),
				})
				resolve(true)
			})
		},
		'defaults:db'() {
			return seedDatabase()
		},
		DBClear({ tableName }: { tableName: string }) {
			return clearTable(tableName)
		},
		DBInsert({ tableName, data }: { tableName: string; data: any[] }) {
			return arbitraryInsert(tableName, data)
		},
		addAccounts() {
			return addAccountsToDatabase()
		},
		cleanup() {
			return cleanupConnection()
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
					console.error(error.message)
					reject(error)
				}
			})
		},
	})
	injectDevServer(on, config)
	return config
}
