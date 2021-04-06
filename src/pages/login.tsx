import LoginForm from '@components/LoginForm'
import handleSSAuth from '@utils/SSAuth'
import { GetServerSideProps } from 'next'
import React from 'react'

const Login = () => {
	return (
		<div>
			<h1>Login</h1>
			<LoginForm />
		</div>
	)
}

export const getServerSideProps: GetServerSideProps = async (context) => {
	const status = handleSSAuth(context, ['admin', 'driver', 'manager'])
	if (status.isValid)
		return {
			redirect: {
				destination: '/secure',
				permanent: false,
			},
		}

	return { props: {} }
}

export default Login
