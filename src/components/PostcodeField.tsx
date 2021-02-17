import React from 'react'
import { FormControl, InputGroup } from 'react-bootstrap'
import SpinnerButton from './SpinnerButton'

interface ComponentProps {
	loading: boolean
	onChange?: (value: string) => void
	isInvalid: boolean
	isValid: boolean
	invalidMessage: string
	onValidate: React.MouseEventHandler<HTMLElement>
}

const PostcodeField = ({
	loading,
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
				onChange={(e) => onChange(e.target.value)}
			/>
			<InputGroup.Append>
				<SpinnerButton
					id='postcode-validator'
					status={loading}
					type='button'
					variant='outline-primary'
					passiveText='Validate'
					activeText='Validating...'
					onClick={onValidate}
				/>
			</InputGroup.Append>
			<FormControl.Feedback type='invalid'>
				{invalidMessage}
			</FormControl.Feedback>
		</InputGroup>
	)
}

export default PostcodeField
