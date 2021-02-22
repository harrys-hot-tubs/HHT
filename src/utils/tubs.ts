import { TubDB } from '@typings/Tub'
import _ from 'lodash'

export const displayableTubs = (tubs: TubDB[]) => {
	const shuffled = _.shuffle(tubs)
	const displayable = []
	shuffled.forEach((tub) => {
		if (!containsSize(displayable, tub)) displayable.push(tub)
	})

	return displayable
}

const containsSize = (
	tubs: TubDB[],
	{ max_capacity: capacity }: TubDB
): boolean => {
	return tubs.some((tub) => tub.max_capacity == capacity)
}
