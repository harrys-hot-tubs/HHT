import SpinnerButton from '@components/SpinnerButton'
import React from 'react'
import { FormControl, InputGroup } from 'react-bootstrap'

interface ComponentProps {
	loading: boolean
	postcode: string
	onChange?: (value: string) => void
	isInvalid: boolean
	isValid: boolean
	invalidMessage: string
	onValidate: React.MouseEventHandler<HTMLElement>
}

const PostcodeField = ({
	loading,
	postcode,
	onChange,
	isInvalid,
	isValid,
	invalidMessage,
	onValidate,
}: ComponentProps) => {
	return (
		<InputGroup className='mb-3'>
			<FormControl
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
					variant='outline-primary'
					activeText='Validating...'
					onClick={onValidate}
				>
					Validate
				</SpinnerButton>
			</InputGroup.Append>
			<FormControl.Feedback type='invalid'>
				{invalidMessage}
			</FormControl.Feedback>
		</InputGroup>
	)
}

export default PostcodeField
