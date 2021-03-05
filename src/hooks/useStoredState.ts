import { useEffect, useState } from 'react'

export interface UseStoredStateArgs<T> {
	name: string
	fallback: T
	toString: (value: T) => string
	fromString: (value: string) => T
}

const useStoredState = <T>({
	name,
	fallback,
	toString,
	fromString,
}: UseStoredStateArgs<T>): [T, (value: T) => void] => {
	const [state, setState] = useState<T>(fallback)

	const updateState = (value: T): void => {
		localStorage.setItem(name, toString(value))
		setState(value)
	}

	useEffect(() => {
		const storedString = localStorage.getItem(name)
		if (storedString !== null) {
			setState(fromString(storedString))
		}
	}, [])

	return [state, updateState]
}

export default useStoredState
