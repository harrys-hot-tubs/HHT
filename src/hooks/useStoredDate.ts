import useStoredState from '@hooks/useStoredState'
import { stringToMoment } from '@utils/date'
import moment from 'moment'

/**
 * Stores a date in localStorage.
 * @param key The key this date will be stored with in localStorage.
 */
const useStoredDate = (
	key: string
): [moment.Moment, (value: moment.Moment) => void] =>
	useStoredState<moment.Moment>({
		key,
		fallback: null,
		toString: (v) => v?.toISOString(),
		fromString: (v) => {
			try {
				return stringToMoment(v)
			} catch (error) {
				return null
			}
		},
	})

export default useStoredDate
