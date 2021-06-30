import PasswordField from '@components/PasswordField'
import PasswordStrengthMeter from '@components/PasswordStrengthMeter'
import SpinnerButton from '@components/SpinnerButton'
import TooltipButton from '@components/TooltipButton'
import ValidatedEmailField from '@components/ValidatedEmailField'
import useStoredState from '@hooks/useStoredState'
import {
	CreateAccountRequest,
	CreateAccountResponse,
} from '@typings/api/Accounts'
import { AuthRequest } from '@typings/api/Auth'
import axios from 'axios'
import Cookies from 'js-cookie'
import { useRouter } from 'next/router'
import React, { FormEventHandler, useState } from 'react'
import {
	Col,
	Form,
	OverlayTrigger,
	Popover,
	PopoverContent,
} from 'react-bootstrap'
import Alert from './Alert'

export interface UserInformation {
	emailAddress: string
	firstName: string
	lastName: string
	telephoneNumber: string
}

export interface EmailStatus {
	confirmationCode: string
	valid: boolean
}

export interface PasswordStatus {
	password: string
	acceptable: boolean
}

const SignUpForm = () => {
	const router = useRouter()
	const [validated, setValidated] = useState(false)
	const [loading, setLoading] = useState(false)
	const [emailStatus, setEmailStatus] = useState<EmailStatus>({
		confirmationCode: '',
		valid: false,
	})
	const [passwordStatus, setPasswordStatus] = useState<PasswordStatus>({
		acceptable: false,
		password: '',
	})
	const [user, setUserInformation] = useStoredState<UserInformation>({
		fallback: {
			emailAddress: '',
			firstName: '',
			lastName: '',
			telephoneNumber: '',
		},
		key: 'signUpInformation',
		fromString: JSON.parse,
		toString: JSON.stringify,
	})
	const [error, setError] = useState(undefined)
	const submitDisabled = !emailStatus.valid || !passwordStatus.acceptable

	const handleSubmit: FormEventHandler<HTMLFormElement> = async (event) => {
		setLoading(true)
		const form = event.currentTarget
		event.preventDefault()
		event.stopPropagation()
		if (form.checkValidity() === false) {
			setValidated(true)
		} else {
			try {
				await createAccount(
					user,
					passwordStatus.password,
					emailStatus.confirmationCode
				)
				const {
					data: { token },
				} = await axios.post<{ token: string }>('/api/auth', {
					email: user.emailAddress,
					password: passwordStatus.password,
				} as AuthRequest)

				Cookies.set('token', token)
				router.push('/dashboard')
			} catch (error) {
				console.error(error.message)
				setError('Failed to create your account.')
				return setLoading(false)
			}
		}
	}

	return (
		<Form noValidate validated={validated} role='main' onSubmit={handleSubmit}>
			<Alert error={error} />
			<Form.Group>
				<Form.Label>Email Address</Form.Label>
				<ValidatedEmailField
					isValid={emailStatus.valid}
					email={user.emailAddress}
					onEmailChange={(e) => {
						setUserInformation({
							...user,
							emailAddress: e.currentTarget.value,
						})
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
			<Form.Control.Feedback type='invalid' id='email-error' role='alert'>
				This field is required.
			</Form.Control.Feedback>
			<Form.Group>
				<Form.Label>Password</Form.Label>
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
						required
						autoComplete='new-password'
						spellCheck={false}
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
			<Form.Row>
				<Form.Group as={Col}>
					<Form.Label>First Name</Form.Label>
					<Form.Control
						aria-label='first-name'
						required
						autoComplete='given-name'
						autoCapitalize='words'
						value={user.firstName}
						onChange={(e) =>
							setUserInformation({
								...user,
								firstName: e.currentTarget.value,
							})
						}
						aria-describedby='first-name-error'
					/>
					<Form.Control.Feedback
						type='invalid'
						id='first-name-error'
						role='alert'
					>
						This field is required.
					</Form.Control.Feedback>
				</Form.Group>
				<Form.Group as={Col}>
					<Form.Label>Last Name</Form.Label>
					<Form.Control
						aria-label='last-name'
						required
						autoComplete='family-name'
						value={user.lastName}
						onChange={(e) =>
							setUserInformation({
								...user,
								lastName: e.currentTarget.value,
							})
						}
						aria-describedby='last-name-error'
					/>
				</Form.Group>
			</Form.Row>
			<Form.Group>
				<Form.Label>Phone Number</Form.Label>
				<Form.Control
					aria-label='telephone'
					required
					autoComplete='tel'
					value={user.telephoneNumber}
					onChange={(e) =>
						setUserInformation({
							...user,
							telephoneNumber: e.currentTarget.value,
						})
					}
					aria-describedby='telephone-error'
				/>
				<Form.Control.Feedback type='invalid' id='telephone-error' role='alert'>
					This field is required.
				</Form.Control.Feedback>
			</Form.Group>
			<TooltipButton
				placement='right'
				overlay={
					<Popover id='submit-button-tooltip' show={submitDisabled}>
						<Popover.Content>
							{generateTooltip(!emailStatus.valid, !passwordStatus.acceptable)}
						</Popover.Content>
					</Popover>
				}
				disabled={submitDisabled}
			>
				<SpinnerButton
					type='submit'
					disabled={submitDisabled}
					status={loading}
					activeText='Creating your account...'
					data-testid='submit-button'
				>
					Submit
				</SpinnerButton>
			</TooltipButton>
		</Form>
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
	if (emailInvalid && passwordUnacceptable)
		return 'Please confirm your email address and increase the strength of your password.'
	if (emailInvalid) return 'Please confirm your email address.'
	if (passwordUnacceptable)
		return 'Please increase the strength of your password.'
}

/**
 * Sends a request to create a new account to the API.
 *
 * @param user The information of the user to be added to the database.
 * @param password The password of the user to be added to the database.
 * @param confirmationCode The confirmation code of the user to be added to the database.
 */
const createAccount = async (
	user: UserInformation,
	password: string,
	confirmationCode: string
) => {
	const { status } = await axios.post<CreateAccountResponse>('/api/accounts', {
		...user,
		password,
		confirmationCode,
	} as CreateAccountRequest)
	if (status !== 200) throw new Error('Account creation failed.')
}

export default SignUpForm
