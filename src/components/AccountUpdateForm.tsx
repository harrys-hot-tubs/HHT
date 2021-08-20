import PasswordField from '@components/PasswordField'
import PasswordStrengthMeter from '@components/PasswordStrengthMeter'
import {
	EmailStatus,
	PasswordStatus,
	UserInformation,
} from '@components/SignUpForm'
import SpinnerButton from '@components/SpinnerButton'
import TooltipButton from '@components/TooltipButton'
import UpdateEmailField from '@components/UpdateEmailField'
import {
	FormattedAccount,
	UpdateAccountRequest,
	UpdateAccountResponse,
} from '@typings/api/Accounts'
import { AccountDB } from '@typings/db/Account'
import axios from 'axios'
import React, { FormEventHandler, ReactNode, useState } from 'react'
import {
	Alert,
	AlertProps,
	Col,
	Form,
	OverlayTrigger,
	Popover,
	PopoverContent,
} from 'react-bootstrap'

interface ComponentProps {
	account: FormattedAccount
	updateCache: (
		data?: FormattedAccount | Promise<FormattedAccount>,
		shouldRevalidate?: boolean
	) => Promise<FormattedAccount | undefined>
}

const AccountUpdateForm = ({ account, updateCache }: ComponentProps) => {
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
	const [user, setUserInformation] = useState<UserInformation>({
		emailAddress: '',
		firstName: '',
		lastName: '',
		telephoneNumber: '',
	})
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
	const allEmpty =
		user.emailAddress === '' &&
		user.firstName === '' &&
		user.lastName === '' &&
		user.telephoneNumber === '' &&
		passwordStatus.password === ''
	const submitDisabled =
		(passwordStatus.password !== '' && !passwordStatus.acceptable) ||
		(user.emailAddress !== '' && !emailStatus.valid) ||
		allEmpty

	const clearForm = () => {
		setValidated(false)
		setEmailStatus({ confirmationCode: '', valid: false })
		setPasswordStatus({ password: '', acceptable: false })
		setUserInformation({
			emailAddress: '',
			firstName: '',
			lastName: '',
			telephoneNumber: '',
		})
	}

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
				const res = await updateAccount(
					user,
					passwordStatus.password,
					account.account_id
				)
				setLoading(false)
				await updateCache(res.updated)
				setAlertProps({
					show: true,
					variant: 'success',
					heading: 'Success!',
					content: generateSuccessMessage(res.fieldsChanged),
				})
				clearForm()
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
		<Form
			noValidate
			validated={validated}
			onSubmit={handleSubmit}
			className='account-update-form'
		>
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
				<UpdateEmailField
					isValid={emailStatus.valid}
					required={false}
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
					placeholder={account.email_address}
					requestPath={`/api/email/${account.account_id}`}
				/>
			</Form.Group>
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
						autoComplete='given-name'
						autoCapitalize='words'
						value={user.firstName}
						onChange={(e) =>
							setUserInformation({
								...user,
								firstName: e.currentTarget.value,
							})
						}
						placeholder={account.first_name}
					/>
				</Form.Group>
				<Form.Group as={Col}>
					<Form.Label>Last Name</Form.Label>
					<Form.Control
						aria-label='last-name'
						autoComplete='family-name'
						value={user.lastName}
						onChange={(e) =>
							setUserInformation({
								...user,
								lastName: e.currentTarget.value,
							})
						}
						placeholder={account.last_name}
					/>
				</Form.Group>
			</Form.Row>
			<Form.Group>
				<Form.Label>Phone Number</Form.Label>
				<Form.Control
					aria-label='telephone'
					autoComplete='tel'
					value={user.telephoneNumber}
					onChange={(e) =>
						setUserInformation({
							...user,
							telephoneNumber: e.currentTarget.value,
						})
					}
					placeholder={account.telephone_number}
				/>
			</Form.Group>
			<TooltipButton
				data-testid='update-account-button-container'
				placement='right'
				overlay={
					<Popover id='update-account-button-tooltip' show={submitDisabled}>
						<Popover.Content>
							{generateTooltip(
								user.emailAddress !== '' && !emailStatus.valid,
								passwordStatus.password !== '' && !passwordStatus.acceptable,
								allEmpty
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
					activeText='Updating your account...'
					data-testid='submit-button'
				>
					Update
				</SpinnerButton>
			</TooltipButton>
		</Form>
	)
}

/**
 * Generates a tooltip for the user to explain what needs to be done in order to submit the form.
 *
 * @param emailInvalid True if the email has been changed and has not yet been validated.
 * @param passwordUnacceptable True if the password has been changed is not strong enough to be accepted.
 * @param allEmpty True if none of the update fields have been changed.
 * @returns A message to the user that explains what needs to be done in order to submit their request to create a new account.
 */
const generateTooltip = (
	emailInvalid: boolean,
	passwordUnacceptable: boolean,
	allEmpty: boolean
) => {
	if (allEmpty) return 'Please alter your account information.'
	if (emailInvalid && passwordUnacceptable)
		return 'Please confirm your new email address and increase the strength of your password.'
	if (emailInvalid) return 'Please confirm your new email address.'
	if (passwordUnacceptable)
		return 'Please increase the strength of your password.'
}

/**
 * Sends a request to update an account to the API.
 *
 * @param user The information of the user to be updated in the database.
 * @param password The password of the user to be updated in the database.
 * @param account_id The id of the account to be updated.
 */
const updateAccount = async (
	user: UserInformation,
	password: string,
	account_id: AccountDB['account_id']
): Promise<{
	updated: FormattedAccount
	fieldsChanged: (keyof UpdateAccountRequest)[]
}> => {
	const body: UpdateAccountRequest = {
		first_name: user.firstName,
		last_name: user.lastName,
		email_address: user.emailAddress,
		telephone_number: user.telephoneNumber,
		password,
	}

	// Remove all non-changes
	Object.keys(body).forEach((key) => {
		if (body[key] === '') delete body[key]
	})

	const { status, data } = await axios.patch<UpdateAccountResponse>(
		`api/accounts/${account_id}`,
		body
	)
	if (status !== 200) throw new Error('Account creation failed.')
	if (data.error === true) throw new Error(data.message)
	return {
		updated: data.updated,
		fieldsChanged: Object.keys(body) as (keyof UpdateAccountRequest)[],
	}
}

/**
 * Generates a message for the user based on the fields that were updated by the previous request.
 *
 * @param fieldsChanged The fields that were updated by the previous request.
 * @returns A message for the user.
 */
const generateSuccessMessage = (
	fieldsChanged: (keyof UpdateAccountRequest)[]
): ReactNode => {
	const fieldMappings: { [key in keyof UpdateAccountRequest]: string } = {
		first_name: 'First name',
		last_name: 'Last name',
		email_address: 'Email address',
		telephone_number: 'Telephone number',
		password: 'Password',
		account_roles: 'Account roles',
		active_information_request: 'Information request status',
		confirmation_code: 'Confirmation code',
		confirmed: 'Confirmation status',
	}

	return (
		<div>
			We have successfully updated your:
			<ul>
				{fieldsChanged.map((field, idx) => (
					<li key={idx}>{fieldMappings[field]}</li>
				))}
			</ul>
		</div>
	)
}

export default AccountUpdateForm
