import { Role } from '@typings/db/Account'

export type CreateAccountResponse =
	| Omit<AccountDB, 'password_hash' | 'confirmation_code'>
	| APIError

export interface CreateAccountRequest {
	emailAddress: string
	confirmationCode: string
	password: string
	firstName: string
	lastName: string
	telephoneNumber: string
	accountRoles?: Role[]
}

export interface NewAccount {
	emailAddress: string
	password: string
	firstName: string
	lastName: string
	telephoneNumber: string
	accountRoles?: Role[]
}
