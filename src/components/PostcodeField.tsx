import PostcodeModal from '@components/modals/postcode_modals/PostcodeModal'
import { PostcodeError } from '@utils/validators/postcodeValidator'
import React, { useEffect, useState } from 'react'
import { FormControl } from 'react-bootstrap'

interface ComponentProps {
	/**
	 * Whether the postcode is being validated.
	 */
	loading: boolean
	/**
	 * The customer's postcode.
	 */
	postcode: string
	/**
	 * Function to be called when the postcode is updated.
	 */
	onChange?: (value: string) => void
	/**
	 * True if the postcode is not valid.
	 */
	isInvalid: boolean
	/**
	 * True if the postcode is valid.
	 */
	isValid: boolean
	/**
	 * The reason the postcode is identified as invalid.
	 */
	invalidReason: PostcodeError
	/**
	 * Function to be called when the postcode is validated.
	 */
	onValidate: () => Promise<void>
}

/**
 * Text entry field allowing the customer to enter their postcode and allowing the postcode to be validated.
 */
const PostcodeField = ({
	loading,
	postcode,
	onChange,
	isInvalid,
	isValid,
	invalidReason,
	onValidate,
}: ComponentProps) => {
	const [touched, setTouched] = useState(false)

	useEffect(() => {
		const delayDebounce = setTimeout(() => {
			if (touched || postcode) onValidate()
		}, 1000)

		return () => clearTimeout(delayDebounce)
	}, [postcode])

	return (
		<>
			<FormControl
				as='input'
				id='postcode'
				aria-label='postcode'
				aria-describedby='postcode-error'
				placeholder='Postcode'
				autoComplete='postal-code'
				isInvalid={isInvalid}
				isValid={isValid}
				value={postcode}
				onChange={(e) => {
					if (!touched) setTouched(true)
					onChange(e.target.value)
				}}
				htmlSize={8}
			/>
			<FormControl.Feedback
				type='invalid'
				id='postcode-error'
				role='alert'
				aria-label='postcode-feedback'
			>
				{generateFeedback(invalidReason)}
			</FormControl.Feedback>
			<PostcodeModal invalidReason={invalidReason} />
		</>
	)
}

const generateFeedback = (invalidReason: PostcodeError) => {
	switch (invalidReason) {
		case 'format':
			return 'Postcode is not in the correct format.'
		case 'missing':
			return 'Postcode is required.'
		case 'range':
			return 'Postcode is not in delivery range.'
		case 'blocked':
			return 'Delivery at this location is subject to change.'
		case 'other':
			return 'An unknown error occurred.'
		default:
			return null
	}
}

export default PostcodeField
