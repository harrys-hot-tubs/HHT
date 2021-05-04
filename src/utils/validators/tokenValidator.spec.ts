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
	it('detects incorrectly typed account ids', () => {
		const missing: Omit<TokenAccount, 'account_id'> = {}

		const nulled: TokenAccount = {
			account_id: null,
			...missing,
		}

		const wrong: Omit<TokenAccount, 'account_id'> & {
			account_id: string
		} = {
			account_id: 'asdas',
			...missing,
		}

		expect(isTokenAccount(missing)).toEqual(false)
		expect(isTokenAccount(nulled)).toEqual(false)
		expect(isTokenAccount(wrong)).toEqual(false)
	})

	it('detects complete accounts', () => {
		const complete: TokenAccount = {
			account_id: 1,
		}

		expect(isTokenAccount(complete)).toEqual(true)
	})
})
