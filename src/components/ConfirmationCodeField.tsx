import SpinnerButton from '@components/SpinnerButton'
import {
	ValidateConfirmationCodeRequest,
	ValidateConfirmationCodeResponse,
} from '@typings/api/Email'
import axios from 'axios'
import React, { useState } from 'react'
import { Form, InputGroup } from 'react-bootstrap'

interface ComponentProps {
	email: string
	value: string
	isValidCode: boolean
	onChange: React.ChangeEventHandler<HTMLInputElement>
	setConfirmed: (value: boolean) => void
	requestPath?: string
}

const VerificationCodeField = ({
	email,
	onChange,
	value,
	isValidCode,
	setConfirmed,
	requestPath = '/api/email',
}: ComponentProps) => {
	const [spinning, setSpinning] = useState(false)
	const [validated, setValidated] = useState(false)

	return (
		<Form.Group>
			<InputGroup>
				<Form.Control
					isInvalid={!isValidCode && validated}
					placeholder='Enter code'
					value={value}
					onChange={onChange}
					aria-label='confirmation-code'
					aria-describedby='confirmation-code-error'
				/>

				<InputGroup.Append>
					<SpinnerButton
						status={spinning}
						activeText='Confirming...'
						onClick={async () => {
							setSpinning(true)
							try {
								const { data } =
									await axios.post<ValidateConfirmationCodeResponse>(
										requestPath,
										{
											validate: true,
											confirmationCode: value,
											email,
										} as ValidateConfirmationCodeRequest
									)
								if (data.error === true) throw new Error(data.message)

								setConfirmed(data.valid)

								if (!data.valid) {
									setSpinning(false)
									setValidated(true)
								}
							} catch (error) {
								console.error(error.message)
								setSpinning(false)
								setValidated(true)
							}
						}}
						aria-label='confirmation-code-validation-button'
					>
						Confirm
					</SpinnerButton>
				</InputGroup.Append>
				<Form.Control.Feedback
					type='invalid'
					id='confirmation-code-error'
					role='alert'
				>
					Confirmation code not recognised.
				</Form.Control.Feedback>
			</InputGroup>
			<Form.Text>
				Please enter the verification code that we sent to <var>{email}</var>.
			</Form.Text>
		</Form.Group>
	)
}

export default VerificationCodeField
