import { useRouter } from 'next/router'
import React, { useEffect } from 'react'
import { Button } from 'react-bootstrap'

const Home = () => {
	const router = useRouter()

	useEffect(() => {
		router.prefetch('/hire')
	}, [])

	return (
		<div>
			<div className='lead-container'>
				<h1 className='title'>Harry's Hot Tubs</h1>
				<Button
					onClick={(e) => router.push('/hire')}
					className='call-to-action'
				>
					Hire a Hot Tub
				</Button>
			</div>
			<div className='details-container'>
				<p className='background-text'>Harry's Hot Tubs</p>
				<p className='introduction'>
					Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer in
					nulla aliquet libero lacinia hendrerit id nec metus. Quisque gravida.
				</p>
			</div>
		</div>
	)
}

export default Home
