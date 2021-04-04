import { NewAccount } from '@typings/api/Accounts'

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
