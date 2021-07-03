import ConfirmEmailField from '@components/ConfirmEmailField'
import PasswordField from '@components/PasswordField'
import PasswordStrengthMeter from '@components/PasswordStrengthMeter'
import { EmailStatus, PasswordStatus } from '@components/SignUpForm'
import SpinnerButton from '@components/SpinnerButton'
import TooltipButton from '@components/TooltipButton'
import {
	ResetPasswordRequest,
	ResetPasswordResponse,
} from '@typings/api/Accounts'
import axios from 'axios'
import Link from 'next/link'
import React, { FormEventHandler, ReactNode, useState } from 'react'
import {
	Alert,
	AlertProps,
	Form,
	OverlayTrigger,
	Popover,
	PopoverContent,
} from 'react-bootstrap'

const Reset = () => {
	const [validated, setValidated] = useState(false)
	const [loading, setLoading] = useState(false)
	const [emailStatus, setEmailStatus] = useState<EmailStatus>({
		confirmationCode: '',
		valid: false,
	})
	const [passwordStatus, setPasswordStatus] = useState<PasswordStatus>({
		password: '',
		acceptable: false,
	})
	const [emailAddress, setEmailAddress] = useState('')
	const [alertProps, setAlertProps] = useState<
		Pick<AlertProps, 'variant' | 'show'> & {
			heading: string
			content: ReactNode
		}
	>({
		variant: undefined,
		show: false,
		heading: undefined,
		content: undefined,
	})
	const submitDisabled =
		passwordStatus.password === '' ||
		!passwordStatus.acceptable ||
		emailAddress === '' ||
		!emailStatus.valid

	const handleSubmit: FormEventHandler<HTMLFormElement> = async (event) => {
		setLoading(true)
		const form = event.currentTarget
		event.preventDefault()
		event.stopPropagation()
		if (form.checkValidity() === false) {
			setValidated(true)
			setLoading(false)
		} else {
			try {
				await resetPassword(
					emailAddress,
					emailStatus.confirmationCode,
					passwordStatus.password
				)
				setLoading(false)
				setAlertProps({
					show: true,
					variant: 'success',
					heading: 'Success!',
					content: (
						<div>
							<p>Your password has been successfully updated.</p>
							<Link href='login'>Login</Link>
						</div>
					),
				})
			} catch (error) {
				setAlertProps({
					show: true,
					variant: 'danger',
					heading: 'Failure!',
					content: <p>{error.message}</p>,
				})
				console.error(error.message)
				setLoading(false)
			}
		}
	}

	return (
		<div className='outer'>
			<Form noValidate validated={validated} onSubmit={handleSubmit}>
				<Alert
					variant={alertProps.variant}
					show={alertProps.show}
					dismissible
					onClose={() => setAlertProps({ ...alertProps, show: false })}
					data-testid='account-update-alert'
				>
					<Alert.Heading>{alertProps.heading}</Alert.Heading>
					{alertProps.content}
				</Alert>
				<Form.Group>
					<Form.Label>Email Address</Form.Label>
					<ConfirmEmailField
						isValid={emailStatus.valid}
						required
						email={emailAddress}
						onEmailChange={(e) => {
							setEmailAddress(e.currentTarget.value)
							setEmailStatus({ confirmationCode: '', valid: false })
						}}
						confirmationCode={emailStatus.confirmationCode}
						onConfirmationCodeChange={(e) =>
							setEmailStatus({
								...emailStatus,
								confirmationCode: e.currentTarget.value,
							})
						}
						setConfirmed={(value) =>
							setEmailStatus({ ...emailStatus, valid: value })
						}
					/>
				</Form.Group>
				{emailStatus.valid ? (
					<Form.Group>
						<Form.Label>New Password</Form.Label>
						<OverlayTrigger
							trigger='focus'
							placement='bottom'
							overlay={
								<Popover id='password-popover' className='strength-popover'>
									<PopoverContent>
										<PasswordStrengthMeter
											password={passwordStatus.password}
											onChange={(acceptable) =>
												setPasswordStatus({ ...passwordStatus, acceptable })
											}
										/>
									</PopoverContent>
								</Popover>
							}
						>
							<PasswordField
								aria-label='password'
								autoComplete='new-password'
								spellCheck={false}
								required
								value={passwordStatus.password}
								onChange={(e) =>
									setPasswordStatus({
										...passwordStatus,
										password: e.currentTarget.value,
									})
								}
							/>
						</OverlayTrigger>
					</Form.Group>
				) : null}
				<TooltipButton
					data-testid='reset-password-button-container'
					placement='right'
					overlay={
						<Popover id='reset-password-button-tooltip' show={submitDisabled}>
							<Popover.Content>
								{generateTooltip(
									emailAddress === '' || !emailStatus.valid,
									passwordStatus.password === '' || !passwordStatus.acceptable
								)}
							</Popover.Content>
						</Popover>
					}
					disabled={submitDisabled}
				>
					<SpinnerButton
						type='submit'
						disabled={submitDisabled}
						status={loading}
						activeText='Resetting your password...'
						data-testid='submit-button'
					>
						Reset
					</SpinnerButton>
				</TooltipButton>
			</Form>
		</div>
	)
}

/**
 * Generates a tooltip for the user to explain what needs to be done in order to submit the form.
 *
 * @param emailInvalid True if the email has not yet been validated.
 * @param passwordUnacceptable True if the password is not strong enough to be accepted.
 * @returns A message to the user that explains what needs to be done in order to submit their request to create a new account.
 */
const generateTooltip = (
	emailInvalid: boolean,
	passwordUnacceptable: boolean
) => {
	if (emailInvalid) return 'Please confirm your email address.'
	if (passwordUnacceptable)
		return 'Please increase the strength of your password.'
}

const resetPassword = async (
	emailAddress: string,
	confirmationCode: string,
	password: string
): Promise<boolean> => {
	const { status, data } = await axios.patch<ResetPasswordResponse>(
		'/api/accounts/reset',
		{ email: emailAddress, confirmationCode, password } as ResetPasswordRequest
	)

	if (status !== 200) throw new Error('Password reset failed.')
	if (data.error === true) throw new Error(data.message)
	return data.reset
}

export default Reset
