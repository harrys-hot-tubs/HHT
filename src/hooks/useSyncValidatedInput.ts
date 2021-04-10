import useStoredState, { UseStoredStateArgs } from '@hooks/useStoredState'
import { useEffect, useState } from 'react'

export interface UseValidatedInputArgs<T, U> extends UseStoredStateArgs<T> {
	/**
	 * Function to be called when the input is validated.
	 */
	validator: (value: T) => [boolean, U]
}

/**
 * Synchronously validates and stores user input.
 */
const useValidatedInput = <T, U>({
	validator,
	key,
	fallback,
	toString,
	fromString,
}: UseValidatedInputArgs<T, U>) => {
	const [storedValue, setStoredValue] = useStoredState<T>({
		fallback,
		key,
		toString,
		fromString,
	})
	const [workingValue, setWorkingValue] = useState(storedValue)
	const [valid, setValid] = useState<boolean>(undefined)
	const [reason, setReason] = useState<U>(undefined)

	useEffect(() => {
		setWorkingValue(storedValue)
	}, [storedValue])

	const makeValid = () => {
		setValid(true)
		setReason(undefined)
	}

	const makeInvalid = (message: U) => {
		setValid(false)
		setReason(message)
	}

	const validate = () => {
		const [valid, error] = validator(workingValue)
		if (valid) {
			makeValid()
			setStoredValue(workingValue)
		} else makeInvalid(error)
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
	}
}

export default useValidatedInput
