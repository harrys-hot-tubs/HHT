import { NewAccount } from '@typings/api/Accounts'
import { APIError } from '@typings/api/Error'
import { ConnectedRequest } from '@typings/api/Request'
import { AccountDB } from '@typings/db/Account'
import db from '@utils/db'
import { getToken, isAuthorised } from '@utils/SSAuth'
import bcrypt from 'bcrypt'
import { NextApiResponse } from 'next'
import { LocationDB } from '../../typings/db/Location'

export const SALT_ROUNDS = 10

async function handler(req: ConnectedRequest, res: NextApiResponse) {
	switch (req.method) {
		case 'POST':
			return await post(req, res)
		case 'GET':
			return await get(req, res)
		default:
			res.setHeader('Allow', ['POST', 'GET'])
			res.status(405).end('Method not allowed.')
	}
}

const post = async (
	req: ConnectedRequest,
	res: NextApiResponse<AccountDB | APIError>
) => {
	const { db } = req
	const newAccount: NewAccount = req.body
	try {
		const preparedAccount = await prepareAccount(newAccount)
		const storedAccount: AccountDB = (
			await db<AccountDB>('accounts').insert(preparedAccount, '*')
		)[0]
		return res.status(200).json(storedAccount)
	} catch (e) {
		return res
			.status(400)
			.json({ type: 'Error', message: 'Failed to create account.' })
	}
}

/**
 * Transforms the constituent parts of an account into the final form to be stored in the database.
 * @param account The components of an account to be created.
 * @returns An account object to be stored in the database.
 */
export const prepareAccount = async (
	account: NewAccount
): Promise<Omit<AccountDB, 'account_id'>> => {
	const hashedPassword = await bcrypt.hash(account.password, SALT_ROUNDS)
	const preparedAccount: Omit<AccountDB, 'account_id'> = {
		email_address: account.emailAddress,
		password_hash: hashedPassword,
		first_name: account.firstName,
		last_name: account.lastName,
		account_roles: account.accountRoles,
		telephone_number: account.telephoneNumber,
	}
	return preparedAccount
}

const get = async (req: ConnectedRequest, res: NextApiResponse) => {
	try {
		const token = getToken(req)
		const status = await isAuthorised(token, ['driver'])
		if (status.authorised) {
			const { db } = req
			const location = await db<LocationDB>('locations')
				.select('locations.name', 'locations.location_id')
				.join('staff', 'staff.location_id', 'locations.location_id')
				.where('staff.account_id', '=', status.payload.account_id)
				.first()

			if (location === undefined)
				return res
					.status(500)
					.send(`Missing staff entry for account ${status.payload.account_id}`)

			return res.status(200).json(location)
		} else {
			return res.status(401).send('Not authorised.')
		}
	} catch (error) {
		console.error(error)
		return res.status(500).send('A problem occurred.')
	}
}

export default db()(handler)
