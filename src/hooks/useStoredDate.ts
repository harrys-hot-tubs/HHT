import useStoredState from '@hooks/useStoredState'

/**
 * Stores a date in localStorage.
 * @param key The key this date will be stored with in localStorage.
 */
const useStoredDate = (
	key: string
): [Date, (value: Date) => void, () => void] =>
	useStoredState<Date>({
		key,
		fallback: null,
		toString: (v) => v?.toISOString(),
		fromString: (v) => new Date(v),
	})

export default useStoredDate
