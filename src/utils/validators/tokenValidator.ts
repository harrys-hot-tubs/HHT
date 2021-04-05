import { TokenAccount } from '@typings/api/Auth'
import jwt from 'jsonwebtoken'

export type TokenError = 'expired' | 'malformed'

const validateToken = (token: string): [boolean, TokenError] => {
	try {
		jwt.verify(token, process.env.TOKEN_SECRET)
		return [true, null]
	} catch (error) {
		switch (error.name) {
			case 'TokenExpiredError':
				return [false, 'expired']
			default:
				return [false, 'malformed']
		}
	}
}

export const isTokenAccount = (value: any): value is TokenAccount => {
	return (
		typeof value.first_name === 'string' &&
		typeof value.last_name === 'string' &&
		Array.isArray(value.account_roles) &&
		value.account_roles.every((element: any) => typeof element === 'string')
	)
}

export default validateToken
