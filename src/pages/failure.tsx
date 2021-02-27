import Head from 'next/head'
import React from 'react'

const Failure = () => {
	return (
		<div className='failure-container'>
			<Head>
				<title>Payment Unsuccessful</title>
			</Head>
			<h1>Oh no!</h1>
			<h2>For some reason we were unable to accept your payment.</h2>
			<span className='home-text'>
				Back to{' '}
				<a href='/' className='home-link'>
					home
				</a>
				.
			</span>
		</div>
	)
}

export default Failure
