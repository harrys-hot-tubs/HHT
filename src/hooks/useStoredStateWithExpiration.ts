import { UseStoredStateArgs } from '@hooks/useStoredState'
import { useEffect, useState } from 'react'

export interface ValueWithExpiration {
	value: string
	exp: number
}

export interface UseStoredStateWithExpirationArgs<T>
	extends UseStoredStateArgs<T> {
	/**
	 * The number of milliseconds the stored value will be valid for.
	 */
	ttl?: number
	/**
	 * Type guard function to check the parsed value from storage is valid.
	 */
	isType: (value: unknown) => value is T
}

/**
 * Stores a value of any type in localStorage.
 */
const useStoredStateWithExpiration = <T>({
	key,
	fallback,
	toString,
	fromString,
	isType,
	ttl: defaultTTL = 3600 * 1000,
}: UseStoredStateWithExpirationArgs<T>): [
	T,
	(value: T, ttl?: number) => void,
	() => void
] => {
	const [state, setState] = useState<T>(fallback)

	/**
	 * Parses the stored value from localStorage.
	 */
	const fetchState = () => {
		const storedString = localStorage.getItem(key)
		const item = JSON.parse(storedString) as unknown
		if (storedString !== undefined && isValueWithExpiration(item)) {
			// If the value has expired or is the wrong type, reset.
			if (Date.now() > item?.exp || !isType(fromString(item.value)))
				return resetState()
			return setState(fromString(item.value))
		}
		updateState(fallback)
	}

	/**
	 * Updates current value and inserts it into localStorage along with an expiration time.
	 *
	 * @param v The value to be stored in localStorage.
	 * @param ttl The unix time the value will expire at.
	 */
	const updateState = (value: T, ttl: number = defaultTTL): void => {
		const item: ValueWithExpiration = {
			value: toString(value),
			exp: Date.now() + ttl,
		}

		localStorage.setItem(key, JSON.stringify(item))
		setState(value)
	}

	/**
	 * Resets the current value and removes the value from localStorage.
	 */
	const resetState = () => {
		localStorage.removeItem(key)
		setState(fallback)
	}

	useEffect(() => {
		fetchState()
	}, [])

	return [state, updateState, resetState]
}

/**
 * Custom type-guard function to check the type of the value received from localStorage.
 *
 * @param value The value received from localStorage.
 * @returns True if the value is an instanceof the ValueWithExpiration type, false otherwise.
 */
const isValueWithExpiration = (value: unknown): value is ValueWithExpiration =>
	value &&
	typeof (value as ValueWithExpiration)?.exp === 'number' &&
	typeof (value as ValueWithExpiration)?.value === 'string'

export default useStoredStateWithExpiration
