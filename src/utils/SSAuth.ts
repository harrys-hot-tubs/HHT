import { TokenAccount } from '@typings/api/Auth'
import { Role } from '@typings/db/Account'
import validateToken, {
	isTokenAccount,
	TokenError,
} from '@utils/validators/tokenValidator'
import jwt from 'jsonwebtoken'
import { GetServerSidePropsContext } from 'next'
import { NextApiRequestCookies } from 'next/dist/next-server/server/api-utils'
import { IncomingMessage } from 'node:http'
import { ParsedUrlQuery } from 'querystring'

export type SSRRequest = IncomingMessage & {
	cookies: NextApiRequestCookies
}

export type AuthResponse =
	| {
			isValid: true
			payload: TokenAccount
	  }
	| {
			isValid: false
			error: TokenError | 'missing' | 'invalid' | 'forbidden'
	  }

export const getToken = ({ cookies }: SSRRequest) => {
	return cookies.token
}

const handleSSAuth = (
	ctx: GetServerSidePropsContext<ParsedUrlQuery>,
	permittedRoles: Role[]
): AuthResponse => {
	const token = getToken(ctx.req)

	if (!token) return { isValid: false, error: 'missing' }

	const [isValid, error] = validateToken(token)
	if (!isValid) return { isValid: false, error }

	const payload: unknown = jwt.decode(token)

	if (!isTokenAccount(payload)) return { isValid: false, error: 'invalid' }

	if (!payload.account_roles.some((role) => permittedRoles.includes(role)))
		return { isValid: false, error: 'forbidden' }

	return { isValid: true, payload }
}

export default handleSSAuth
