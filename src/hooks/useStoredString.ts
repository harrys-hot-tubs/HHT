import useStoredState from '@hooks/useStoredState'

const useStoredString = (name: string): [string, (value: string) => void] => [
	...useStoredState<string>({
		name,
		fallback: '',
		fromString: (v) => v,
		toString: (v) => v,
	}),
]

export default useStoredString
