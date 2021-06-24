import ConfirmationCodeField from '@components/ConfirmationCodeField'
import SpinnerButton from '@components/SpinnerButton'
import {
	VerifyEmailFailed,
	VerifyEmailRequest,
	VerifyEmailResponse,
} from '@typings/api/Email'
import axios, { AxiosError, AxiosResponse } from 'axios'
import React, { useState } from 'react'
import { Form, InputGroup } from 'react-bootstrap'

interface ComponentProps {
	email: string
	confirmationCode: string
	isValid: boolean
	onEmailChange: React.ChangeEventHandler<HTMLInputElement>
	onConfirmationCodeChange: React.ChangeEventHandler<HTMLInputElement>
	setConfirmed: (value: boolean) => void
}

const ValidatedEmailField = ({
	email,
	onEmailChange,
	confirmationCode,
	onConfirmationCodeChange,
	isValid: emailIsValid,
	setConfirmed,
}: ComponentProps) => {
	const [emailError, setEmailError] = useState(undefined)
	const [validatorSpinning, setValidatorSpinning] = useState(false)
	const [emailIsInvalid, setEmailIsInvalid] = useState(false)
	const [awaitingVerificationCode, setAwaitingVerificationCode] =
		useState(false)

	const onValidate: React.MouseEventHandler<HTMLElement> = async (_event) => {
		setValidatorSpinning(true)
		try {
			const { data } = await axios.post<
				VerifyEmailRequest,
				AxiosResponse<VerifyEmailResponse>
			>('/api/email', { email, validate: false })
			if (data.error) throw new Error(data.message)
			setEmailIsInvalid(false)
			setAwaitingVerificationCode(true)
		} catch (error) {
			if (axios.isAxiosError(error)) {
				const axiosError: AxiosError<VerifyEmailFailed> = error
				setEmailError(axiosError.response.data.message)
			} else {
				setEmailError(error.message)
			}

			setEmailIsInvalid(true)
		} finally {
			setValidatorSpinning(false)
		}
	}

	return (
		<>
			<InputGroup>
				<Form.Control
					isValid={emailIsValid}
					isInvalid={emailIsInvalid}
					disabled={emailIsValid}
					aria-label='email'
					required
					autoComplete='email'
					value={email}
					onChange={(event) => {
						onEmailChange(event as React.ChangeEvent<HTMLInputElement>)
						setEmailError(false)
						setEmailIsInvalid(false)
					}}
					aria-describedby='email-error'
				/>
				{emailIsValid ? null : (
					<InputGroup.Append>
						<SpinnerButton
							disabled={email.length === 0}
							status={validatorSpinning}
							onClick={onValidate}
							activeText='Validating...'
							aria-label='email-validation-button'
						>
							Validate
						</SpinnerButton>
					</InputGroup.Append>
				)}
				<Form.Control.Feedback id='email-error' type='invalid'>
					{emailError}
				</Form.Control.Feedback>
			</InputGroup>
			{awaitingVerificationCode && !emailIsValid ? (
				<ConfirmationCodeField
					email={email}
					value={confirmationCode}
					isValidCode={emailIsValid}
					onChange={onConfirmationCodeChange}
					setConfirmed={setConfirmed}
				/>
			) : null}
		</>
	)
}

export default ValidatedEmailField