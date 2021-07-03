import { TubDB } from '@typings/db/Tub'

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

export const zeroPrice: TubDB = {
	location_id: 2,
	max_capacity: 4,
	tub_id: 6,
	available: true,
}

export const tubs: TubDB[] = [...sameSize, ...differentSizes, zeroPrice]
