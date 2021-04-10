import { AuthRequest, AuthResponse, TokenAccount } from '@typings/api/Auth'
import { ConnectedRequest } from '@typings/api/Request'
import { AccountDB } from '@typings/db/Account'
import db from '@utils/db'
import bcrypt from 'bcrypt'
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

const passwordsMatch = async (
	password: string,
	storedPasswordHash: string
): Promise<boolean> => {
	return await bcrypt.compare(password, storedPasswordHash)
}

const tokeniseAccount = ({ account_id }: AccountDB): string => {
	const payload: TokenAccount = {
		account_id,
	}
	return jwt.sign(payload, process.env.TOKEN_SECRET, {
		expiresIn: '1h',
	})
}

export default db()(handler)
