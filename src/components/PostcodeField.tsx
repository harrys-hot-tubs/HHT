import SpinnerButton from '@components/SpinnerButton'
import { PostcodeError } from '@utils/validators'
import React from 'react'
import { FormControl, InputGroup } from 'react-bootstrap'
import PostcodeModal from './postcode_modals/PostcodeModal'

interface ComponentProps {
	loading: boolean
	postcode: string
	onChange?: (value: string) => void
	isInvalid: boolean
	isValid: boolean
	invalidReason: PostcodeError
	onValidate: React.MouseEventHandler<HTMLElement>
}

const PostcodeField = ({
	loading,
	postcode,
	onChange,
	isInvalid,
	isValid,
	invalidReason,
	onValidate,
}: ComponentProps) => {
	console.log(`invalidReason`, isInvalid)
	return (
		<React.Fragment>
			<InputGroup className='postcode-field'>
				<FormControl
					id='postcode'
					aria-label='postcode'
					aria-describedby='postcode-error'
					placeholder='Postcode'
					autoComplete='postal-code'
					isInvalid={isInvalid}
					isValid={isValid}
					value={postcode}
					onChange={(e) => onChange(e.target.value)}
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
