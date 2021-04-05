export interface AccountDB {
	account_id: number
	email_address: string
	password_hash: string
	first_name: string
	last_name: string
	telephone_number: string
	// Account_roles are retrieved as a string due to Knex's lack of support for array columns.
	account_roles: Role[]
}

export type Role = 'admin' | 'customer' | 'driver' | 'manager'
