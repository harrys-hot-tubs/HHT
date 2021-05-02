import { AccountDB, Role } from '@typings/db/Account'
import { connector } from '@utils/db'
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
			authorised: true
			payload: Omit<AccountDB, 'password_hash'>
	  }
	| {
			authorised: false
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
const handleSSAuth = async (
	ctx: GetServerSidePropsContext<ParsedUrlQuery>,
	permittedRoles: Role[]
): Promise<AuthResponse> => {
	const token = getToken(ctx.req)
	return await isAuthorised(token, permittedRoles)
}

export const isAuthorised = async (
	token: string,
	permittedRoles: Role[]
): Promise<AuthResponse> => {
	if (!token) return { authorised: false, error: 'missing' }

	const [isValid, error] = validateToken(token)
	if (!isValid) return { authorised: false, error }

	const payload: unknown = jwt.decode(token)

	if (!isTokenAccount(payload)) return { authorised: false, error: 'invalid' }

	const account = await fetchAccount(payload.account_id)

	if (!accountIsPermitted(permittedRoles, account.account_roles))
		return { authorised: false, error: 'forbidden' }

	return { authorised: true, payload: account }
}

export const fetchAccount = async (
	accountID: number
): Promise<Omit<AccountDB, 'password_hash'>> => {
	const connection = connector()()
	const rawAccount = await connection<AccountDB>('accounts')
		.select()
		.where('account_id', '=', accountID)
		.first()
	delete rawAccount.password_hash
	await connection.destroy()
	return {
		...rawAccount,
		account_roles: convertRoles(
			(rawAccount.account_roles as unknown) as string
		),
	}
}

/**
 * Transforms the stored form of roles in the database into a JS object.
 */
const convertRoles = (account_roles: string): Role[] => {
	return account_roles.slice(1, -1).split(',') as Role[]
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

export const hasRole = (
	{ account_roles }: Pick<AccountDB, 'account_roles'>,
	role: Role
) => {
	return account_roles.includes(role)
}

export default handleSSAuth
