import useStoredState from '@hooks/useStoredState'

export interface UseDateRangeArgs {
	startKey: string
	endKey: string
	swap?: boolean
}

const useDateRange = ({ startKey, endKey, swap = false }: UseDateRangeArgs) => {
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
		if (value > rangeEnd && rangeEnd !== null && swap) {
			setRangeStart(rangeEnd)
			setRangeEnd(value)
		} else {
			setRangeStart(value)
		}
	}

	const updateRangeEnd = (value: Date) => {
		if (value < rangeStart && rangeStart !== null && swap) {
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
