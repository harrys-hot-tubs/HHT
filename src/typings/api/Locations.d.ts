import { LocationDB } from '../Location'

export type RangeResponse =
	| {
			inRange: true
			closest: LocationDB
	  }
	| {
			inRange: false
	  }

export interface RangeRequest {
	latitude: number
	longitude: number
}
