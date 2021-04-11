import SpinnerButton from '@components/SpinnerButton'
import { AuthRequest, AuthResponse } from '@typings/api/Auth'
import axios from 'axios'
import Cookies from 'js-cookie'
import { useRouter } from 'next/router'
import React, { FormEventHandler, useState } from 'react'
import { Form } from 'react-bootstrap'

/**
 * Form used by the user to login to the application.
 */
const LoginForm = () => {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const router = useRouter()

	const handleSubmit: FormEventHandler<HTMLFormElement> = async (event) => {
		event.preventDefault()
		event.stopPropagation()
		try {
			const params: AuthRequest = { email, password }
			const res = await axios.post<AuthRequest, AuthResponse>(
				'/api/auth',
				params
			)
			const { token } = res.data as AuthResponse
			router.push('/dashboard')
			Cookies.set('token', token)
		} catch (e) {
			console.error(e)
		}
	}

	return (
		<Form onSubmit={handleSubmit}>
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
				status={false}
				activeText='Logging in...'
				data-testid='submit'
			>
				Login
			</SpinnerButton>
		</Form>
	)
}

export default LoginForm
