import SpinnerButton from '@components/SpinnerButton'
import { AuthRequest } from '@typings/api/Auth'
import axios from 'axios'
import Cookies from 'js-cookie'
import { useRouter } from 'next/router'
import React, { FormEventHandler, useState } from 'react'
import { Form } from 'react-bootstrap'
import Alert from './Alert'

/**
 * Form used by the user to login to the application.
 */
const LoginForm = () => {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState(undefined)
	const router = useRouter()

	const handleSubmit: FormEventHandler<HTMLFormElement> = async (event) => {
		event.preventDefault()
		event.stopPropagation()
		try {
			setError(undefined)
			setLoading(true)
			const {
				data: { token },
			} = await axios.post<{ token: string }>('/api/auth', {
				email,
				password,
			} as AuthRequest)

			Cookies.set('token', token)
			router.push('/dashboard')
		} catch (error) {
			console.error(error.message)
			setError('Email address and password do not match.')
		} finally {
			setLoading(false)
		}
	}

	return (
		<Form onSubmit={handleSubmit}>
			<Alert error={error} />
			<Form.Group>
				<Form.Label>Email Address</Form.Label>
				<Form.Control
					aria-label='email'
					required
					autoComplete='email'
					value={email}
					onChange={(e) => setEmail(e.target.value)}
				/>
			</Form.Group>
			<Form.Group>
				<Form.Label>Password</Form.Label>
				<Form.Control
					aria-label='password'
					required
					type='password'
					autoComplete='current-password'
					value={password}
					onChange={(e) => setPassword(e.target.value)}
				/>
			</Form.Group>
			<SpinnerButton
				className='button'
				type='submit'
				status={loading}
				activeText='Logging in...'
				data-testid='submit'
			>
				Login
			</SpinnerButton>
		</Form>
	)
}

export default LoginForm
