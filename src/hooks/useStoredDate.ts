import useStoredState from '@hooks/useStoredState'
import moment from 'moment'

const useStoredDate = (
	name: string
): [moment.Moment, (value: moment.Moment) => void] => [
	...useStoredState<moment.Moment>({
		name,
		fallback: null,
		toString: (v) => v?.toISOString(),
		fromString: (v) => moment(v),
	}),
]

export default useStoredDate
