import { AccountDB } from '@typings/db/Account'
import { LocationDB } from '@typings/db/Location'

export interface StaffDB {
	account_id: AccountDB['account_id']
	location_id: LocationDB['location_id']
}
