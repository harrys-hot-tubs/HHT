export interface TubDB {
	tub_id: number
	location_id: number
	max_capacity: number
	available: boolean
}

export interface PopulatedTub {
	tub_id: number
	location: LocationDB
	max_capacity: number
}
