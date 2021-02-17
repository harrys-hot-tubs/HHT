import { useState } from 'react'

const useAsyncValidatedInput = <T>(
	validator: (value: T) => Promise<[boolean, string]>
) => {
	const [value, setValue] = useState<T>(undefined)
	const [loading, setLoading] = useState(false)
	const [valid, setValid] = useState<boolean>(undefined)
	const [message, setMessage] = useState<string>(undefined)

	const makeValid = () => {
		setValid(true)
		setMessage(undefined)
	}

	const makeInvalid = (message: string) => {
		setValid(false)
		setMessage(message)
	}

	const validate = async () => {
		setLoading(true)
		const [valid, error] = await validator(value)
		if (valid) makeValid()
		else makeInvalid(error)

		setLoading(false)
	}

	return {
		value,
		setValue,
		valid,
		message,
		validate,
		makeValid,
		makeInvalid,
		loading,
	}
}

export default useAsyncValidatedInput
