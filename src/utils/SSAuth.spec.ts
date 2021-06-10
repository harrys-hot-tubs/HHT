import { driverAccount } from '@fixtures/accountFixtures'
import {
	expiredObject,
	inDateAccountToken,
	nonExpiredObject,
} from '@fixtures/authFixtures'
import { cleanupDatabase, connection } from '@helpers/DBHelper'
import { AccountDB, Role } from '@typings/db/Account'
import handleSSAuth, {
	accountIsPermitted,
	AuthResponse,
	getToken,
	hasRole,
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

	beforeAll(async () => {
		await connection<AccountDB>('accounts').insert([driverAccount])
	})

	it('identifies missing tokens', async () => {
		const context: IncompleteContext = {
			req: { cookies: { notAToken: 'token' } },
		}

		await expect(
			handleSSAuth(context as ExpectedContent, [])
		).resolves.toEqual<AuthResponse>({
			authorised: false,
			error: 'missing',
		})
	})

	it('identifies expired tokens', async () => {
		const context: IncompleteContext = {
			req: { cookies: { token: expiredObject } },
		}

		await expect(
			handleSSAuth(context as ExpectedContent, [])
		).resolves.toEqual<AuthResponse>({
			authorised: false,
			error: 'expired',
		})
	})

	it('identifies malformed tokens', async () => {
		const context: IncompleteContext = {
			req: { cookies: { token: nonExpiredObject.substring(10) } },
		}

		await expect(
			handleSSAuth(context as ExpectedContent, [])
		).resolves.toEqual<AuthResponse>({
			authorised: false,
			error: 'malformed',
		})
	})

	it('rejects tokens with an incorrect payload', async () => {
		const context: IncompleteContext = {
			req: { cookies: { token: nonExpiredObject } },
		}

		await expect(
			handleSSAuth(context as ExpectedContent, [])
		).resolves.toEqual<AuthResponse>({
			authorised: false,
			error: 'invalid',
		})
	})

	it('rejects payloads with incompatible roles', async () => {
		const context: IncompleteContext = {
			req: { cookies: { token: inDateAccountToken(driverAccount) } },
		}

		await expect(
			handleSSAuth(context as ExpectedContent, ['customer'])
		).resolves.toEqual<AuthResponse>({
			authorised: false,
			error: 'forbidden',
		})
	})

	it('accepts valid tokens', async () => {
		const context: IncompleteContext = {
			req: { cookies: { token: inDateAccountToken(driverAccount) } },
		}

		const expectedResponse = driverAccount
		delete expectedResponse.password_hash
		await expect(
			handleSSAuth(context as ExpectedContent, driverAccount.account_roles)
		).resolves.toMatchObject<AuthResponse>({
			authorised: true,
			payload: expectedResponse,
		})
	})

	it('allows login for all roles with "*" set for permittedRoles', async () => {
		const context: IncompleteContext = {
			req: { cookies: { token: inDateAccountToken(driverAccount) } },
		}

		const expectedResponse = driverAccount
		delete expectedResponse.password_hash
		await expect(
			handleSSAuth(context as ExpectedContent, ['*'])
		).resolves.toMatchObject<AuthResponse>({
			authorised: true,
			payload: expectedResponse,
		})
	})

	afterAll(async () => {
		await cleanupDatabase(connection)
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

describe('hasRole', () => {
	it('identifies an account with a role', () => {
		const roles: Pick<AccountDB, 'account_roles'> = {
			account_roles: ['driver'],
		}
		expect(hasRole(roles, 'driver')).toBeTruthy()
	})

	it('identifies an account without a role', () => {
		const roles: Pick<AccountDB, 'account_roles'> = {
			account_roles: ['driver'],
		}
		expect(hasRole(roles, 'customer')).toBeFalsy()
	})

	it('returns false for a non-existent role', () => {
		const roles = {
			account_roles: ['swimmer'],
		} as unknown as Pick<AccountDB, 'account_roles'>
		expect(hasRole(roles, 'customer')).toBeFalsy()
	})
})
