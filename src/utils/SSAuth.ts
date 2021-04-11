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

/**
 * Determines whether or not a user is authenticated and permitted to view a given page.
 * @param ctx The context of the page request.
 * @param permittedRoles The roles allowed to access the page.
 * @returns The user's account information if they are permitted to view this page, else throws an error.
 */
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

	if (!accountIsPermitted(permittedRoles, payload.account_roles))
		return { isValid: false, error: 'forbidden' }

	return { isValid: true, payload }
}

/**
 * Determines whether a user is permitted to view a page.
 * @param permittedRoles The list of roles permitted to view the page.
 * @param accountRoles The roles associated with the user attempting to view the page.
 * @returns True if the user is permitted to view the page, else false.
 */
export const accountIsPermitted = (
	permittedRoles: Role[],
	accountRoles: Role[]
): boolean => {
	if (accountRoles.length === 0) return false
	if (permittedRoles.includes('*')) return true

	return accountRoles.some((role) => permittedRoles.includes(role))
}

export default handleSSAuth
