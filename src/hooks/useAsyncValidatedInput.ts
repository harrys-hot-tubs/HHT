import useStoredState, { UseStoredStateArgs } from '@hooks/useStoredState'
import { useEffect, useState } from 'react'

interface HookArgs<T, U> extends UseStoredStateArgs<T> {
	validator: (value: T) => Promise<[boolean, U]>
}

const useAsyncValidatedInput = <T, U>({
	validator,
	name,
	fallback,
	toString,
	fromString,
}: HookArgs<T, U>) => {
	const [storedValue, setStoredValue] = useStoredState<T>({
		fallback,
		name,
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

	const makeValid = () => {
		setValid(true)
		setReason(undefined)
	}

	const makeInvalid = (message: U) => {
		setValid(false)
		setReason(message)
	}

	const validate = async () => {
		setLoading(true)
		const [valid, error] = await validator(workingValue)
		if (valid) {
			makeValid()
			setStoredValue(workingValue)
		} else makeInvalid(error)

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
