import PasswordField from '@components/PasswordField'
import React, { FormEventHandler, useState } from 'react'
import {
	Col,
	Form,
	InputGroup,
	OverlayTrigger,
	Popover,
	PopoverContent,
} from 'react-bootstrap'
import PasswordStrengthMeter from './PasswordStrengthMeter'
import SpinnerButton from './SpinnerButton'

const SignUpForm = () => {
	const [validated, setValidated] = useState(false)
	const [loading, setLoading] = useState(false)
	const [user, setUserInformation] = useState<{
		email: string
		password: string
		firstName: string
		lastName: string
		phoneNumber: string
	}>({
		email: '',
		password: '',
		firstName: '',
		lastName: '',
		phoneNumber: '',
	})

	const handleSubmit: FormEventHandler<HTMLFormElement> = async (event) => {
		event.preventDefault()
	}

	return (
		<Form noValidate validated={validated} role='main' onSubmit={handleSubmit}>
			<Form.Group>
				<Form.Label>Email Address</Form.Label>
				<InputGroup>
					<Form.Control
						aria-label='email'
						required
						autoComplete='email'
						value={user.email}
						onChange={(e) =>
							setUserInformation({
								...user,
								email: e.currentTarget.value,
							})
						}
						aria-describedby='email-error'
					/>
					<InputGroup.Append>
						<SpinnerButton status={false} activeText='Validating...'>
							Validate
						</SpinnerButton>
					</InputGroup.Append>
				</InputGroup>
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
								<PasswordStrengthMeter password={user.password} />
							</PopoverContent>
						</Popover>
					}
				>
					<PasswordField
						aria-label='password'
						required
						autoComplete='new-password'
						value={user.password}
						onChange={(e) =>
							setUserInformation({
								...user,
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
					value={user.phoneNumber}
					onChange={(e) =>
						setUserInformation({
							...user,
							phoneNumber: e.currentTarget.value,
						})
					}
					aria-describedby='telephone-error'
				/>
				<Form.Control.Feedback type='invalid' id='telephone-error' role='alert'>
					This field is required.
				</Form.Control.Feedback>
			</Form.Group>
		</Form>
	)
}

export default SignUpForm
