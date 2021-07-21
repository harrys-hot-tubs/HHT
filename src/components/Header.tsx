import React from 'react'
import { Nav, Navbar } from 'react-bootstrap'
import Image from 'next/image'

const Header = () => {
	return (
		<Navbar bg='pink' expand='sm'>
			<Navbar.Brand href='/'>
				<Image
					src='/logo.png'
					alt="Harry's Hot Tubs Logo"
					width={80}
					height={80}
					className='logo'
				/>
			</Navbar.Brand>

			<Navbar.Toggle />
			<Navbar.Collapse>
				<Nav>
					<Nav.Link href='/#book'>Book</Nav.Link>
					<Nav.Link href='/docs/FAQs.pdf'>FAQs</Nav.Link>
					<Nav.Link href='/docs/T&Cs.pdf'>Terms and Conditions</Nav.Link>
				</Nav>
				<Nav className='justify-content-end'>
					<Nav.Link href='/login'>Login</Nav.Link>
					<Nav.Link href='/signup'>Sign Up</Nav.Link>
				</Nav>
			</Navbar.Collapse>
		</Navbar>
	)
}

export default Header
