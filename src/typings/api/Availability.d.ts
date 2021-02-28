import { LocationDB } from '@typings/Location'
import { TubDB } from '@typings/Tub'

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
