import { Role } from '@typings/db/Account'

export interface NewAccount {
	emailAddress: string
	password: string
	firstName: string
	lastName: string
	telephoneNumber: string
	accountRoles?: Role[]
}
