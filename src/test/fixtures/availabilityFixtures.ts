import { locations } from '@fixtures/locationFixtures'
import { AvailabilityRequest } from '@typings/api/Availability'
import { generateEndDate, generateStartDate } from './bookingFixtures'

export const openBookingRequest: AvailabilityRequest = {
	closest: locations[0].location_id,
	startDate: '2017-01-01',
	endDate: '2017-01-03',
}

export const closedBookingRequest: AvailabilityRequest = {
	closest: locations[0].location_id,
	startDate: generateStartDate(),
	endDate: generateEndDate(),
}
