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
	return (
		<>
			<InputGroup className='postcode-field'>
				<FormControl
					id='postcode'
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
					>
						Check Availability
					</SpinnerButton>
				</InputGroup.Append>
				<FormControl.Feedback type='invalid'>
					{generateFeedback(invalidReason)}
				</FormControl.Feedback>
			</InputGroup>
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
	}
}

export default PostcodeField
