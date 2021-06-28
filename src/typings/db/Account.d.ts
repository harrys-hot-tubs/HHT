export interface AccountDB {
	account_id: number
	email_address: string
	password_hash?: string
	first_name?: string
	last_name?: string
	telephone_number?: string
	/** Account_roles are retrieved as a string due to Knex's lack of support for array columns. Defaults to customer. */
	account_roles: Role[]
	/** Defaults to false. */
	confirmed: boolean
	confirmation_code: string
	active_information_request: boolean
}

// '*' type does not exist in the database, but it's useful for authorisation.
export type Role = 'admin' | 'customer' | 'driver' | 'manager' | '*'
