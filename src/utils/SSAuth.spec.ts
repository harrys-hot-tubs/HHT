import {
	expiredObject,
	inDateAccountToken,
	nonExpiredObject,
	tokenAccount,
} from '@fixtures/authFixtures'
import handleSSAuth, { AuthResponse, getToken, SSRRequest } from '@utils/SSAuth'
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
})
