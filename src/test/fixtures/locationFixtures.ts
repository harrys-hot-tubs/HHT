import { LocationDB } from '@typings/Location'

export const LOCATIONS: Omit<LocationDB, 'location_id'>[] = [
	{
		name: 'Birmingham',
		postcode: 'B29',
		latitude: 52.4376542402022,
		longitude: -1.94793759418458,
		initial_price: 109.0,
		night_price: 20.0,
	},
]
