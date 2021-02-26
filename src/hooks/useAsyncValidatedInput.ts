import useStoredState, { UseStoredStateArgs } from '@hooks/useStoredState'
import { useState } from 'react'

type ValidationError = ''

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
	const [value, setValue] = useStoredState<T>({
		fallback,
		name,
		toString,
		fromString,
	})
	const [loading, setLoading] = useState(false)
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

	const validate = async () => {
		setLoading(true)
		const [valid, error] = await validator(value)
		if (valid) makeValid()
		else makeInvalid(error)

		setLoading(false)
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
		loading,
	}
}

export default useAsyncValidatedInput
