import { useEffect, useState } from 'react'

export interface UseStoredStateArgs<T> {
	/**
	 * The key the state will be stored under in localStorage.
	 */
	key: string
	/**
	 * The fallback value that will be defaulted to if no stored state is found.
	 */
	fallback: T
	/**
	 * Function to convert data to a string for use in localStorage.
	 */
	toString: (value: T) => string
	/**
	 * Function to convert data from a string for parsing from localStorage.
	 */
	fromString: (value: string) => T
}

/**
 * Stores a value of any type in localStorage.
 */
const useStoredState = <T>({
	key,
	fallback,
	toString,
	fromString,
}: UseStoredStateArgs<T>): [T, (value: T) => void] => {
	const [state, setState] = useState<T>(fallback)

	const updateState = (value: T): void => {
		localStorage.setItem(key, toString(value))
		setState(value)
	}

	useEffect(() => {
		const storedString = localStorage.getItem(key)
		if (storedString !== null) {
			setState(fromString(storedString))
		}
	}, [])

	return [state, updateState]
}

export default useStoredState
