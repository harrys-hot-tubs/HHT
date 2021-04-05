import { TokenAccount } from '@typings/api/Auth'
import jwt from 'jsonwebtoken'

export const signedString = jwt.sign('test', process.env.TOKEN_SECRET)
export const expiredObject = jwt.sign(
	{ value: 'test' },
	process.env.TOKEN_SECRET,
	{
		expiresIn: -30,
	}
)
export const nonExpiredObject = jwt.sign(
	{ value: 'test' },
	process.env.TOKEN_SECRET,
	{
		expiresIn: '1h',
	}
)

export const tokenAccount: TokenAccount = {
	first_name: 'John',
	last_name: 'Doe',
	account_roles: ['admin'],
}

export const inDateAccountToken = jwt.sign(
	tokenAccount,
	process.env.TOKEN_SECRET,
	{
		expiresIn: '1h',
	}
)

export const expiredAccountToken = jwt.sign(
	tokenAccount,
	process.env.TOKEN_SECRET,
	{
		expiresIn: '-1h',
	}
)
