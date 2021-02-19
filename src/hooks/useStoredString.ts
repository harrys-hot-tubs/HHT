import useStoredState from './useStoredState'

const useStoredString = (name: string): [string, (value: string) => void] => [
	...useStoredState({
		name,
		fallback: '',
		fromString: (v) => v,
		toString: (v) => v,
	}),
]

export default useStoredString
