import useStoredState from '@hooks/useStoredState'
import { stringToMoment } from '@utils/date'
import moment from 'moment'

const useStoredDate = (
	name: string
): [moment.Moment, (value: moment.Moment) => void] =>
	useStoredState<moment.Moment>({
		name,
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
