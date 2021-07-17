import PostcodeModal from '@components/modals/postcode_modals/PostcodeModal'
import SpinnerButton from '@components/SpinnerButton'
import { PostcodeError } from '@utils/validators/postcodeValidator'
import React from 'react'
import { FormControl, InputGroup } from 'react-bootstrap'

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
	onValidate: React.MouseEventHandler<HTMLElement>
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
	return (
		<React.Fragment>
			<InputGroup className='postcode-field' hasValidation>
				<FormControl
					id='postcode'
					aria-label='postcode'
					aria-describedby='postcode-error'
					placeholder='Postcode'
					autoComplete='postal-code'
					isInvalid={isInvalid}
					isValid={isValid}
					value={postcode}
					onChange={(e) => onChange(e.target.value.trim())}
				/>
				<InputGroup.Append>
					<SpinnerButton
						id='postcode-validator'
						status={loading}
						type='button'
						activeText='Checking...'
						onClick={onValidate}
						className='postcode-validate-button'
						data-testid='postcode-validate'
					>
						Check Availability
					</SpinnerButton>
				</InputGroup.Append>
				<FormControl.Feedback
					type='invalid'
					id='postcode-error'
					role='alert'
					aria-label='postcode-feedback'
				>
					{generateFeedback(invalidReason)}
				</FormControl.Feedback>
			</InputGroup>
			<PostcodeModal invalidReason={invalidReason} />
		</React.Fragment>
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
