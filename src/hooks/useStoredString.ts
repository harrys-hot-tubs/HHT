import useStoredState from '@hooks/useStoredState'

/**
 * Stores a value under a given	key in localStorage.
 * @param key The key that this value will be stored under in localStorage.
 */
const useStoredString = (
	key: string
): [string, (value: string) => void, () => void] => [
	...useStoredState<string>({
		key,
		fallback: '',
		fromString: (v) => v,
		toString: (v) => v,
	}),
]

export default useStoredString
