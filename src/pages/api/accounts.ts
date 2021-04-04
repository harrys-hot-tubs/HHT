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
		const hashedPassword = await bcrypt.hash(newAccount.password, SALT_ROUNDS)
		const preparedAccount: Omit<AccountDB, 'account_id'> = {
			email_address: newAccount.emailAddress,
			password_hash: hashedPassword,
			first_name: newAccount.firstName,
			last_name: newAccount.lastName,
			account_roles: newAccount.accountRoles,
			telephone_number: newAccount.telephoneNumber,
		}

		const storedAccount: AccountDB = (
			await db<AccountDB>('accounts').insert(preparedAccount, '*')
		)[0]

		return res.status(200).json(storedAccount)
	} catch (e) {
		console.error(e)
		return res
			.status(400)
			.json({ type: 'Error', message: 'Failed to create account.' })
	}
}

export default db()(handler)
