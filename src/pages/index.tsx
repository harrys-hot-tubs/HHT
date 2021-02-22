import { useRouter } from 'next/router'
import React, { useEffect } from 'react'
import { Button } from 'react-bootstrap'

const Home = () => {
	const router = useRouter()

	useEffect(() => {
		router.prefetch('/hire')
	}, [])

	return (
		<div className='container'>
			<div>
				<h1>Harry's Hot Tubs</h1>
				<Button onClick={(e) => router.push('/hire')}>Hire a Hot Tub</Button>
			</div>
			<div className='lozenge' />
			<div>
				<p>
					Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer in
					nulla aliquet libero lacinia hendrerit id nec metus. Quisque gravida.
				</p>
			</div>
		</div>
	)
}

export default Home
