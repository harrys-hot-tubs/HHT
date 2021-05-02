import { TubDB } from '@typings/db/Tub'
import _ from 'lodash'

/**
 * Takes all possible displayable hot tubs and reduces them into an array of unique capacities.
 * @param tubs All possible displayable hot tubs.
 * @returns An array of hot tubs unique by capacity.
 */
export const displayableTubs = (tubs: TubDB[]): TubDB[] => {
	const shuffled = _.shuffle(tubs) // TODO write own fisher-yates shuffle
	const displayable = []
	shuffled.forEach((tub) => {
		if (!containsSize(displayable, tub.max_capacity)) displayable.push(tub)
	})

	return displayable
}

/**
 * Determines whether or not an array of hot tubs already contains one with a certain capacity.
 * @param tubs An array of hot tubs.
 * @param capacity A hot tub's capacity.
 * @returns True if the array contains a tub with the same capacity.
 */
const containsSize = (tubs: TubDB[], capacity: number): boolean => {
	return tubs.some((tub) => tub.max_capacity == capacity)
}
