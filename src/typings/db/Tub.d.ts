import { LocationDB } from '@typings/db/Location'

export interface TubDB {
	tub_id: number
	location_id: LocationDB['location_id']
	max_capacity: number
	available: boolean
}

export interface PopulatedTub {
	tub_id: number
	location: LocationDB
	max_capacity: number
}
