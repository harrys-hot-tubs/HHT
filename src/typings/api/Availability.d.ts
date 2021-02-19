import { LocationDB } from '../Location'
import { TubDB } from '../Tub'

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
