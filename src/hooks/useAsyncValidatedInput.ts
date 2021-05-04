import useStoredState, { UseStoredStateArgs } from '@hooks/useStoredState'
import { useEffect, useState } from 'react'

export interface UseAsyncValidatedInputArgs<T, U>
	extends UseStoredStateArgs<T> {
	/**
	 * Async function to be executed to check the validity of the input.
	 */
	validator: (value: T) => Promise<[boolean, U]>
}

/**
 * Generic hook that allows user input to be validated asynchronously.
 */
const useAsyncValidatedInput = <T, U>({
	validator,
	key,
	fallback,
	toString,
	fromString,
}: UseAsyncValidatedInputArgs<T, U>) => {
	const [storedValue, setStoredValue] = useStoredState<T>({
		fallback,
		key,
		toString,
		fromString,
	})
	const [workingValue, setWorkingValue] = useState(storedValue)
	const [loading, setLoading] = useState(false)
	const [valid, setValid] = useState<boolean>(undefined)
	const [reason, setReason] = useState<U>(undefined)

	useEffect(() => {
		setWorkingValue(storedValue)
	}, [storedValue])

	const makeValid = (message: U) => {
		setValid(true)
		setReason(message)
	}

	const makeInvalid = (message: U) => {
		setValid(false)
		setReason(message)
	}

	const validate = async () => {
		setLoading(true)
		const [valid, message] = await validator(workingValue)
		if (valid) {
			makeValid(message)
			setStoredValue(workingValue)
		} else makeInvalid(message)

		setLoading(false)
	}

	const updateValue = (value: T) => {
		setValid(undefined)
		setWorkingValue(value)
	}

	return {
		value: workingValue,
		setValue: updateValue,
		valid,
		message: reason,
		validate,
		makeValid,
		makeInvalid,
		loading,
	}
}

export default useAsyncValidatedInput
