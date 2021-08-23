import FacebookIcon from '@components/icons/FacebookIcon'
import InstagramIcon from '@components/icons/InstagramIcon'
import useWindowDimensions from '@hooks/useWindowDimensions'
import React from 'react'

const Footer = () => {
	const { width } = useWindowDimensions()

	return (
		<footer className='footer'>
			<div className='links'>
				<a href='/#book'>Hire</a>
				<a href='/docs/T&Cs.pdf'>Terms and Conditions</a>
				<a href='/docs/Privacy Policy.pdf'>GDPR Statement</a>
				<a href='/docs/FAQs.pdf'>FAQs</a>
				{/* <a href='/login'>Login</a>
				<a href='/signup'>Sign Up</a> */}
			</div>

			{width < 768 ? (
				<>
					<hr />
					<div className='secondary'>
						<div className='social-icons'>
							<FacebookIcon />
							<InstagramIcon />
						</div>
						<div className='providence'>
							<>
								Created by <a href='https://maxwood.tech'>Max Wood</a>
							</>
						</div>
					</div>
				</>
			) : (
				<>
					<div className='social-icons'>
						<FacebookIcon />
						<InstagramIcon />
					</div>
					<div className='providence'>
						© Harry’s Hot Tubs 2021 - Created by{' '}
						<a href='https://maxwood.tech'>Max Wood</a>
					</div>
				</>
			)}
		</footer>
	)
}

export default Footer
