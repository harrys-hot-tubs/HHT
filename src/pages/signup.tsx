import SignUpForm from '@components/SignUpForm'
import handleSSAuth from '@utils/SSAuth'
import { GetServerSideProps } from 'next'
import Head from 'next/head'
import React from 'react'

const Signup = () => {
	return (
		<div className='container'>
			<Head>
				<title>Sign Up</title>
			</Head>
			<div className='outer'>
				<h1>Sign Up</h1>
				<SignUpForm />
			</div>
		</div>
	)
}

export const getServerSideProps: GetServerSideProps = async (context) => {
	const status = await handleSSAuth(context, ['*'])
	if (status.authorised)
		return {
			redirect: {
				destination: '/dashboard',
				permanent: false,
			},
		}

	return { props: {} }
}

export default Signup
