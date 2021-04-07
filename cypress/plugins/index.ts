import {
	addAccountToDatabase,
	cleanupConnection,
} from '../helpers/databaseHelper'

module.exports = (on, config) => {
	on('task', {
		async addAccount() {
			console.log(`process.env`, process.env)
			return await addAccountToDatabase()
		},
		async cleanup() {
			return await cleanupConnection()
		},
	})
}
