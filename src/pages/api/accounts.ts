import { NewAccount } from '@typings/api/Accounts'
import { APIError } from '@typings/api/Error'
import { ConnectedRequest } from '@typings/api/Request'
import { AccountDB } from '@typings/db/Account'
import db from '@utils/db'
import bcrypt from 'bcrypt'
import { NextApiResponse } from 'next'

export const SALT_ROUNDS = 10

async function handler(req: ConnectedRequest, res: NextApiResponse) {
	switch (req.method) {
		case 'POST':
			return await post(req, res)
		default:
			res.setHeader('Allow', 'POST')
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

export default db()(handler)
