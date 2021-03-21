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
				<img src='lead3.jpeg' className='hero-image' />
				<h1 className='title'>Harry's Hot Tubs</h1>
				<Button onClick={(e) => router.push('/hire')} bsPrefix='call-to-action'>
					Hire a Hot Tub
				</Button>
			</div>
			<div className='details-container'>
				<p className='background-text'>Harry's Hot Tubs</p>
				<p className='introduction'>
					Boasting 5* reviews from over 1,000 hires, we are proud to be the
					Number One Hot Tub Rental Company in the UK!
				</p>
				<p className='links'>
					<a href='/docs/Privacy Policy.pdf' target='_blank'>
						GDPR Statement
					</a>
					,{' '}
					<a href='/docs/FAQs.pdf' target='_blank'>
						FAQ
					</a>{' '}
					and{' '}
					<a href='/docs/T&Cs.pdf' target='_blank'>
						T&amp;Cs
					</a>
				</p>
			</div>
		</div>
	)
}

export default Home
