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
			<div className='lead-container'>
				<img src='lead1.jpg' className='hero-image' />
				<h1 className='title'>Harry's Hot Tubs</h1>
				<Button onClick={(e) => router.push('/hire')} bsPrefix='call-to-action'>
					Hire a Hot Tub
				</Button>
			</div>
			<div className='details-container'>
				<p className='background-text'>Harry's Hot Tubs</p>
				<p className='introduction'>
					Boasting 5* reviews from over 800 hires, we are proud to be the Number
					One Hot Tub Rental Company in the UK!
				</p>
			</div>
		</div>
	)
}

export default Home
