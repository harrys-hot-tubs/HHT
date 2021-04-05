import {
	expiredObject,
	nonExpiredObject,
	signedString,
} from '@fixtures/authFixtures'
import { TokenAccount } from '@typings/api/Auth'
import validateToken, {
	isTokenAccount,
	TokenError,
} from '@utils/validators/tokenValidator'

describe('validateToken', () => {
	it('rejects missing tokens', () => {
		expect(validateToken('')).toEqual<[boolean, TokenError]>([
			false,
			'malformed',
		])
		expect(validateToken(undefined)).toEqual<[boolean, TokenError]>([
			false,
			'malformed',
		])
		expect(validateToken(null)).toEqual<[boolean, TokenError]>([
			false,
			'malformed',
		])
	})

	it('rejects broken tokens', () => {
		const token = signedString
		expect(validateToken(token.substring(0, token.length - 5))).toEqual<
			[boolean, TokenError]
		>([false, 'malformed'])
	})

	it('rejects expired tokens', () => {
		const token = expiredObject

		expect(validateToken(token)).toEqual<[boolean, TokenError]>([
			false,
			'expired',
		])
	})

	it('accepts valid tokens', () => {
		const token = nonExpiredObject

		expect(validateToken(token)).toEqual<[boolean, TokenError]>([true, null])
	})
})

describe('isTokenAccount', () => {
	it('detects incorrectly typed first names', () => {
		const missing: Omit<TokenAccount, 'first_name'> = {
			last_name: 'Doe',
			account_roles: ['admin'],
		}

		const nulled: TokenAccount = {
			first_name: null,
			...missing,
		}

		const wrong: Omit<TokenAccount, 'first_name'> & { first_name: number } = {
			first_name: 23,
			...missing,
		}

		expect(isTokenAccount(missing)).toEqual(false)
		expect(isTokenAccount(nulled)).toEqual(false)
		expect(isTokenAccount(wrong)).toEqual(false)
	})

	it('detects incorrectly typed last names', () => {
		const missing: Omit<TokenAccount, 'last_name'> = {
			first_name: 'John',
			account_roles: ['admin'],
		}

		const nulled: TokenAccount = {
			last_name: null,
			...missing,
		}

		const wrong: Omit<TokenAccount, 'last_name'> & { last_name: number } = {
			last_name: 23,
			...missing,
		}

		expect(isTokenAccount(missing)).toEqual(false)
		expect(isTokenAccount(nulled)).toEqual(false)
		expect(isTokenAccount(wrong)).toEqual(false)
	})

	it('detects incorrectly typed account roles', () => {
		const missing: Omit<TokenAccount, 'account_roles'> = {
			first_name: 'John',
			last_name: 'Doe',
		}

		const nulled: TokenAccount = {
			account_roles: null,
			...missing,
		}

		const wrong: Omit<TokenAccount, 'account_roles'> & {
			account_roles: number
		} = {
			account_roles: 23,
			...missing,
		}

		expect(isTokenAccount(missing)).toEqual(false)
		expect(isTokenAccount(nulled)).toEqual(false)
		expect(isTokenAccount(wrong)).toEqual(false)
	})

	it('detects complete accounts', () => {
		const complete: TokenAccount = {
			first_name: 'John',
			last_name: 'Doe',
			account_roles: ['admin'],
		}

		expect(isTokenAccount(complete)).toEqual(true)
	})
})
