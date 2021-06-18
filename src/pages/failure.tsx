import Head from 'next/head'
import React from 'react'

/**
 * Page displayed to the customer when their order has not been successfully processed.
 */
const Failure = () => {
	return (
		<div className='failure-container'>
			<Head>
				<title>Payment Unsuccessful</title>
			</Head>
			<div>
			<h1>Oh no!</h1>
			<h2>For some reason we were unable to accept your payment.</h2>
			<span className='home-text'>
				Back to{' '}
				<a href='/' className='home-link' role='link'>
					home
				</a>
				.
			</span>
			</div>
		</div>
	)
}

export default Failure
