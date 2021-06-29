import { AccountDB, Role } from '@typings/db/Account'

export type CreateAccountResponse = FormattedAccount | APIError

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

export type FormattedAccount = Omit<
	AccountDB,
	'password_hash' | 'confirmation_code'
>

export type GetAccountResponse =
	| GetAccountSuccess
	| {
			error: true
			message: string
	  }

export type GetAccountSuccess = {
	error: false
	account: FormattedAccount
}

export type PostAccountRequest = {
	type: AccountRequestType
}

export type AccountRequestType = 'GDPR'

export type PostAccountResponse =
	| {
			error: false
			sent: boolean
	  }
	| {
			error: true
			message: string
	  }

export type DeleteAccountResponse =
	| {
			error: false
			deleted: boolean
	  }
	| { error: true; message: string }
