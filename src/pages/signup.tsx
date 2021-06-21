import SignUpForm from '@components/SignUpForm'
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

export default Signup
