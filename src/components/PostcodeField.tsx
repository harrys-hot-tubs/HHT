import SpinnerButton from '@components/SpinnerButton'
import { PostcodeError } from '@utils/validators'
import React, { useEffect, useState } from 'react'
import { FormControl, InputGroup, Modal } from 'react-bootstrap'
import FacebookIcon from './FacebookIcon'
import InstagramIcon from './InstagramIcon'

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
	const [showModal, setShowModal] = useState(false)

	useEffect(() => {
		if (invalidReason === 'range') {
			setShowModal(true)
		}
	}, [invalidReason])

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
			<Modal show={showModal} onHide={() => setShowModal(false)}>
				<Modal.Header closeButton>
					<Modal.Title>Oh no!</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					Sadly we don't currently offer deliveries in your area. While we
					expand our delivery capacity, check out our social media below.
				</Modal.Body>
				<Modal.Footer>
					<FacebookIcon />
					<InstagramIcon />
				</Modal.Footer>
			</Modal>
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
		case 'other':
			return 'An unknown error occurred.'
	}
}

export default PostcodeField
