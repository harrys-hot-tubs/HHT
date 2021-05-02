import { AuthRequest, AuthResponse, TokenAccount } from '@typings/api/Auth'
import { ConnectedRequest } from '@typings/api/Request'
import { AccountDB } from '@typings/db/Account'
import db from '@utils/db'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { NextApiResponse } from 'next'

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
	res: NextApiResponse<AuthResponse>
) => {
	const { db } = req
	const { email, password }: AuthRequest = req.body
	try {
		const account: AccountDB = await db<AccountDB>('accounts')
			.select()
			.where('email_address', '=', email)
			.first()

		if (!account) throw new Error('Account not found.')

		const match = await passwordsMatch(password, account.password_hash)
		if (!match) throw new Error('Passwords do not match.')

		return res.status(200).json({ token: tokeniseAccount(account) })
	} catch (e) {
		return res
			.status(400)
			.json({ type: 'AuthError', message: 'Failed to create account.' })
	}
}

/**
 * Determines whether two passwords are the same.
 * @param password The password the user is attempting to login with.
 * @param storedPasswordHash The password stored under the account the user is attempting to log into.
 * @returns True if the hash of the password matches the stored hash, false otherwise.
 */
const passwordsMatch = async (
	password: string,
	storedPasswordHash: string
): Promise<boolean> => {
	return await bcrypt.compare(password, storedPasswordHash)
}

/**
 * Transforms an account from the database into a JSON Web Token for transmission to the client.
 * @returns A signed JSON Web Token representing the account the user is logging into.
 */
const tokeniseAccount = ({ account_id }: AccountDB): string => {
	const payload: TokenAccount = {
		account_id,
	}
	return jwt.sign(payload, process.env.TOKEN_SECRET, {
		expiresIn: '1h',
	})
}

export default db()(handler)
