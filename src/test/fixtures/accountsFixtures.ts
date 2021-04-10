import { NewAccount } from '@typings/api/Accounts'
import { AccountDB } from '@typings/db/Account'

export const missingPassword: Omit<NewAccount, 'password'> = {
	firstName: 'John',
	lastName: 'Doe',
	emailAddress: 'john@doe.com',
	telephoneNumber: '12345',
	accountRoles: ['driver'],
}

export const missingRoles: NewAccount = {
	firstName: 'John',
	lastName: 'Doe',
	emailAddress: 'john@doe.com',
	password: 'password',
	telephoneNumber: '12345',
}

export const completeAccount: NewAccount = {
	firstName: 'John',
	lastName: 'Doe',
	emailAddress: 'john@doe.com',
	password: 'password',
	telephoneNumber: '12345',
	accountRoles: ['driver'],
}

export const storedAccount: AccountDB = {
	account_id: 1,
	first_name: 'John',
	last_name: 'Doe',
	account_roles: ['driver'],
	email_address: 'john@doe.com',
	password_hash: 'TESTHASH',
	telephone_number: '12345',
}
