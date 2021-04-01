import Head from 'next/head'
import { useRouter } from 'next/router'
import React, { useEffect } from 'react'
import { Button } from 'react-bootstrap'

const Home = () => {
	const router = useRouter()

	useEffect(() => {
		router.prefetch('/hire')
	}, [])

	return (
		<div className='main'>
			<Head>
				<title>Harry's Hot Tubs</title>
			</Head>
			<div className='lead-container'>
				<img src='lead1.jpg' className='hero-image' />
				<h1 className='title' role='heading' aria-level={1}>
					Harry's Hot Tubs
				</h1>
				<Button
					onClick={(_e) => router.push('/hire')}
					bsPrefix='call-to-action'
					role='link'
					aria-label='hire'
				>
					Hire a Hot Tub
				</Button>
			</div>
			<div className='details-container'>
				<p className='background-text' role='presentation'>
					Harry's Hot Tubs
				</p>
				<p className='introduction'>
					Boasting 5* reviews from over 800 hires, we are proud to be the Number
					One Hot Tub Rental Company in the UK!
				</p>
				<p className='links'>
					<a
						href='/docs/Privacy Policy.pdf'
						target='_blank'
						aria-label='privacy policy'
					>
						GDPR Statement
					</a>
					,{' '}
					<a href='/docs/FAQs.pdf' target='_blank' aria-label='FAQs'>
						FAQ
					</a>{' '}
					and{' '}
					<a
						href='/docs/T&Cs.pdf'
						target='_blank'
						aria-label='terms and conditions'
					>
						T&amp;Cs
					</a>
				</p>
			</div>
		</div>
	)
}

export default Home
