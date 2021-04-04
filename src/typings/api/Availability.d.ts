import { LocationDB } from '@typings/db/Location'
import { TubDB } from '@typings/db/Tub'

export type AvailabilityResponse =
	| {
			available: false
	  }
	| {
			available: true
			tubs: TubDB[]
	  }

export interface AvailabilityRequest {
	closest: LocationDB['location_id']
	startDate: string
	endDate: string
}
