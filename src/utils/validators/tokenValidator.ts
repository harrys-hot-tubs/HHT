import { TokenAccount } from '@typings/api/Auth'
import jwt from 'jsonwebtoken'

export type TokenError = 'expired' | 'malformed'

const validateToken = (token: string): [boolean, TokenError] => {
	try {
		jwt.verify(token, process.env.TOKEN_SECRET)
		return [true, null]
	} catch (error) {
		console.error(error.message)
		switch (error.name) {
			case 'TokenExpiredError':
				return [false, 'expired']
			default:
				return [false, 'malformed']
		}
	}
}

export const isTokenAccount = (value: any): value is TokenAccount => {
	return typeof value.account_id === 'number'
}

export default validateToken
