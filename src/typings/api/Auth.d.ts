import { AccountDB } from '@typings/db/Account'
import { APIError } from '@typings/Error'

export interface AuthRequest {
	email: string
	password: string
}

export type AuthResponse =
	| {
			token: string
	  }
	| APIError

export type TokenAccount = Pick<AccountDB, 'account_id'>
