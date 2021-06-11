import useStoredState from '@hooks/useStoredState'

export interface UseDateRangeArgs {
	startKey: string
	endKey: string
}

const useDateRange = ({ startKey, endKey }: UseDateRangeArgs) => {
	const [rangeStart, setRangeStart, resetStart] = useStoredState<Date>({
		fallback: null,
		fromString: (v) => new Date(v),
		toString: (v) => v?.toISOString(),
		key: startKey,
	})
	const [rangeEnd, setRangeEnd, resetEnd] = useStoredState<Date>({
		fallback: null,
		fromString: (v) => new Date(v),
		toString: (v) => v?.toISOString(),
		key: endKey,
	})

	const updateRangeStart = (value: Date) => {
		if (value > rangeEnd && rangeEnd !== null) {
			setRangeStart(rangeEnd)
			setRangeEnd(value)
		} else {
			setRangeStart(value)
		}
	}

	const updateRangeEnd = (value: Date) => {
		if (value < rangeStart && rangeStart !== null) {
			setRangeEnd(rangeStart)
			setRangeStart(value)
		} else {
			setRangeEnd(value)
		}
	}

	return {
		rangeStart,
		rangeEnd,
		setRangeStart: updateRangeStart,
		setRangeEnd: updateRangeEnd,
		resetRangeStart: resetStart,
		resetRangeEnd: resetEnd,
	}
}

export default useDateRange
