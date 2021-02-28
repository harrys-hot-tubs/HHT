import useStoredState from '@hooks/useStoredState'
import moment from 'moment'

const useStoredDate = (
	name: string
): [moment.Moment, (value: moment.Moment) => void] => [
	...useStoredState<moment.Moment>({
		name,
		fallback: null,
		toString: (v) => v?.toISOString(),
		fromString: (v) => {
			const date = moment(v, true)
			try {
				if (date.format() === 'Invalid date') {
					throw new Error('Failed to parse date.')
				} else {
					return date
				}
			} catch (error) {
				return null
			}
		},
	}),
]

export default useStoredDate
