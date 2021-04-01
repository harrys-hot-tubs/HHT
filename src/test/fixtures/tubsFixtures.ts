import { TubDB } from '@typings/Tub'

export const sameSize: TubDB[] = [
	{
		location_id: 1,
		max_capacity: 2,
		tub_id: 1,
		available: true,
	},
	{
		location_id: 1,
		max_capacity: 2,
		tub_id: 2,
		available: true,
	},
	{
		location_id: 1,
		max_capacity: 2,
		tub_id: 3,
		available: true,
	},
]

export const differentSizes: TubDB[] = [
	{
		location_id: 1,
		max_capacity: 4,
		tub_id: 4,
		available: true,
	},
	{
		location_id: 1,
		max_capacity: 6,
		tub_id: 5,
		available: true,
	},
]

export const mixedSizes: TubDB[] = sameSize.concat(differentSizes)
