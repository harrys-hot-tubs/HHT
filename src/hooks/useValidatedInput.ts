import useStoredState, { UseStoredStateArgs } from '@hooks/useStoredState'
import { useState } from 'react'

interface HookArgs<T, U> extends UseStoredStateArgs<T> {
	validator: (value: T) => [boolean, U]
}

const useValidatedInput = <T, U>({
	validator,
	name,
	fallback,
	toString,
	fromString,
}: HookArgs<T, U>) => {
	const [value, setValue] = useStoredState<T>({
		fallback,
		name,
		toString,
		fromString,
	})
	const [valid, setValid] = useState<boolean>(undefined)
	const [reason, setReason] = useState<U>(undefined)

	const makeValid = () => {
		setValid(true)
		setReason(undefined)
	}

	const makeInvalid = (message: U) => {
		setValid(false)
		setReason(message)
	}

	const validate = () => {
		const [valid, error] = validator(value)
		if (valid) makeValid()
		else makeInvalid(error)
	}

	const updateValue = (value: T) => {
		setValid(undefined)
		setValue(value)
	}

	return {
		value,
		setValue: updateValue,
		valid,
		message: reason,
		validate,
		makeValid,
		makeInvalid,
	}
}

export default useValidatedInput
