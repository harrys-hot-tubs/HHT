import LoginForm from '@components/LoginForm'
import handleSSAuth from '@utils/SSAuth'
import { GetServerSideProps } from 'next'
import Head from 'next/head'
import React from 'react'

/**
 * Page used by all users to allow them to access secured pages.
 */
const Login = () => {
	return (
		<div className='login-container'>
			<Head>
				<title>Login</title>
			</Head>
			<div>
				<h1>Login</h1>
				<LoginForm />
			</div>
		</div>
	)
}

export const getServerSideProps: GetServerSideProps = async (context) => {
	const status = await handleSSAuth(context, ['admin', 'driver', 'manager'])
	if (status.authorised)
		return {
			redirect: {
				destination: '/dashboard',
				permanent: false,
			},
		}

	return { props: {} }
}

export default Login
