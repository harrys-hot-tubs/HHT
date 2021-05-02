import { driverAccount } from '@fixtures/accountsFixtures'
import { locations } from '@fixtures/locationFixtures'
import { StaffDB } from '@typings/db/Staff'

export const storedStaff: StaffDB = {
	account_id: driverAccount.account_id,
	location_id: locations[0].location_id,
}
