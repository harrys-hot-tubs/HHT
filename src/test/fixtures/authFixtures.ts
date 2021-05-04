import { driverAccount } from '@fixtures/accountsFixtures'
import { TokenAccount } from '@typings/api/Auth'
import jwt from 'jsonwebtoken'
import { AccountDB } from '../../typings/db/Account'

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
	account_id: driverAccount.account_id,
}

export const inDateAccountToken = ({ account_id }: AccountDB): string => {
	const tokenAccount: TokenAccount = { account_id }
	return jwt.sign(tokenAccount, process.env.TOKEN_SECRET, {
		expiresIn: '1h',
	})
}

export const expiredAccountToken = ({ account_id }: AccountDB): string => {
	const tokenAccount: TokenAccount = { account_id }
	return jwt.sign(tokenAccount, process.env.TOKEN_SECRET, {
		expiresIn: '-1h',
	})
}
