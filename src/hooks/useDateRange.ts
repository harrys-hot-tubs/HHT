import useStoredState from '@hooks/useStoredState'

export interface UseDateRangeArgs {
	startKey: string
	endKey: string
}

const useDateRange = ({ startKey, endKey }: UseDateRangeArgs) => {
	const [rangeStart, setRangeStart] = useStoredState<Date>({
		fallback: new Date(),
		fromString: (v) => new Date(v),
		toString: (v) => v.toISOString(),
		key: startKey,
	})
	const [rangeEnd, setRangeEnd] = useStoredState<Date>({
		fallback: new Date(),
		fromString: (v) => new Date(v),
		toString: (v) => v.toISOString(),
		key: endKey,
	})

	//TODO invert dates when two dates are incorrectly ordered

	return {
		rangeStart,
		rangeEnd,
		setRangeStart,
		setRangeEnd,
	}
}

export default useDateRange
