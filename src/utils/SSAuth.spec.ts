import {
	expiredObject,
	inDateAccountToken,
	nonExpiredObject,
	tokenAccount,
} from '@fixtures/authFixtures'
import { Role } from '@typings/db/Account'
import handleSSAuth, {
	accountIsPermitted,
	AuthResponse,
	getToken,
	SSRRequest,
} from '@utils/SSAuth'
import { GetServerSidePropsContext } from 'next'
import { ParsedUrlQuery } from 'querystring'

describe('getToken', () => {
	it('retrieves token if it exists', () => {
		const testToken = 'test'
		const req: Pick<SSRRequest, 'cookies'> = { cookies: { token: testToken } }

		expect(getToken(req as SSRRequest)).toEqual(testToken)
	})

	it('fails to retrieve token if it does not exist', () => {
		const testToken = 'test'
		const req: Pick<SSRRequest, 'cookies'> = {
			cookies: { otherValue: testToken },
		}

		expect(getToken(req as SSRRequest)).toEqual(undefined)
	})
})

describe('handleSSAuth', () => {
	type ExpectedContent = GetServerSidePropsContext<ParsedUrlQuery>
	interface IncompleteContext
		extends Omit<Partial<GetServerSidePropsContext<ParsedUrlQuery>>, 'req'> {
		req: Pick<SSRRequest, 'cookies'>
	}

	it('identifies missing tokens', () => {
		const context: IncompleteContext = {
			req: { cookies: { notAToken: 'token' } },
		}

		expect(handleSSAuth(context as ExpectedContent, [])).toEqual<AuthResponse>({
			isValid: false,
			error: 'missing',
		})
	})

	it('identifies expired tokens', () => {
		const context: IncompleteContext = {
			req: { cookies: { token: expiredObject } },
		}

		expect(handleSSAuth(context as ExpectedContent, [])).toEqual<AuthResponse>({
			isValid: false,
			error: 'expired',
		})
	})

	it('identifies malformed tokens', () => {
		const context: IncompleteContext = {
			req: { cookies: { token: nonExpiredObject.substring(10) } },
		}

		expect(handleSSAuth(context as ExpectedContent, [])).toEqual<AuthResponse>({
			isValid: false,
			error: 'malformed',
		})
	})

	it('rejects tokens with an incorrect payload', () => {
		const context: IncompleteContext = {
			req: { cookies: { token: nonExpiredObject } },
		}

		expect(handleSSAuth(context as ExpectedContent, [])).toEqual<AuthResponse>({
			isValid: false,
			error: 'invalid',
		})
	})

	it('rejects payloads with incompatible roles', () => {
		const context: IncompleteContext = {
			req: { cookies: { token: inDateAccountToken } },
		}

		expect(
			handleSSAuth(context as ExpectedContent, ['customer'])
		).toEqual<AuthResponse>({
			isValid: false,
			error: 'forbidden',
		})
	})

	it('accepts valid tokens', () => {
		const context: IncompleteContext = {
			req: { cookies: { token: inDateAccountToken } },
		}

		expect(
			handleSSAuth(context as ExpectedContent, ['admin'])
		).toMatchObject<AuthResponse>({
			isValid: true,
			payload: tokenAccount,
		})
	})

	it('allows login for all roles with "*" set for permittedRoles', () => {
		const context: IncompleteContext = {
			req: { cookies: { token: inDateAccountToken } },
		}

		expect(
			handleSSAuth(context as ExpectedContent, ['*'])
		).toMatchObject<AuthResponse>({
			isValid: true,
			payload: tokenAccount,
		})
	})
})

describe('accountIsPermitted', () => {
	it('permits no account with no roles', () => {
		expect(accountIsPermitted(['*'], [])).toBe(false)
		expect(accountIsPermitted(['customer'], [])).toBe(false)
	})

	it('permits no roles for an empty array', () => {
		expect(accountIsPermitted([], ['admin'])).toBe(false)
		expect(accountIsPermitted([], ['driver'])).toBe(false)
	})

	it('only permits one matching role for length one', () => {
		expect(accountIsPermitted(['customer'], ['customer'])).toBe(true)
		expect(accountIsPermitted(['customer'], ['driver'])).toBe(false)
	})

	it('permits one matching role for length n', () => {
		expect(accountIsPermitted(['customer', 'admin'], ['customer'])).toBe(true)
		expect(accountIsPermitted(['driver', 'customer'], ['manager'])).toBe(false)
	})

	it('permits n matching roles for length n', () => {
		expect(
			accountIsPermitted(['customer', 'admin'], ['admin', 'customer'])
		).toBe(true)
		expect(
			accountIsPermitted(['driver', 'manager'], ['admin', 'customer'])
		).toBe(false)
	})

	it('permits all roles on "*"', () => {
		const allRoles: Role[] = ['admin', 'customer', 'driver', 'manager']
		allRoles.forEach((role) => {
			expect(accountIsPermitted(['*'], [role])).toBe(true)
		})
	})
})
