import { loadStripe, Stripe } from '@stripe/stripe-js'
import { GetStaticProps } from 'next'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { Col, Form } from 'react-bootstrap'
import useCheckoutInformation from '../hooks/useCheckoutInformation'

interface PageProps {
	stripePromise: Stripe
}

const Checkout = ({ stripePromise }: PageProps) => {
	const router = useRouter()
	const [postcode, setPostcode] = useState('')
	const [user, setUser] = useCheckoutInformation()
	console.log('user', user)
	useEffect(() => {
		const storedPostcode = localStorage.getItem('postcode')
		if (storedPostcode === null) router.push('/hire')
		else setPostcode(storedPostcode)
	}, [])

	return (
		<Form>
			<h2>Contact Details</h2>
			<Form.Row>
				<Form.Group as={Col}>
					<Form.Label>First name</Form.Label>
					<Form.Control
						autoComplete='given-name'
						value={user.firstName}
						onChange={(e) =>
							setUser({
								...user,
								firstName: e.target.value,
							})
						}
					/>
				</Form.Group>
				<Form.Group as={Col}>
					<Form.Label>Last name</Form.Label>
					<Form.Control
						autoComplete='family-name'
						value={user.lastName}
						onChange={(e) =>
							setUser({
								...user,
								lastName: e.target.value,
							})
						}
					/>
				</Form.Group>
			</Form.Row>
			<Form.Group>
				<Form.Label>Email address</Form.Label>
				<Form.Control
					autoComplete='email'
					value={user.email}
					onChange={(e) => setUser({ ...user, email: e.target.value })}
				/>
			</Form.Group>
			<Form.Group>
				<Form.Label>Telephone number</Form.Label>
				<Form.Control
					autoComplete='tel'
					value={user.telephoneNumber}
					onChange={(e) =>
						setUser({ ...user, telephoneNumber: e.target.value })
					}
				/>
			</Form.Group>
			<hr />
			<h2>Address</h2>
			<Form.Group>
				<Form.Label>Address line 1</Form.Label>
				<Form.Control
					autoComplete='address-line1'
					value={user.addressLine1}
					onChange={(e) => setUser({ ...user, addressLine1: e.target.value })}
				/>
			</Form.Group>
			<Form.Group>
				<Form.Label>Address line 2</Form.Label>
				<Form.Control
					autoComplete='address-line2'
					value={user.addressLine2}
					onChange={(e) => setUser({ ...user, addressLine2: e.target.value })}
				/>
			</Form.Group>
			<Form.Group>
				<Form.Label>Address line 3</Form.Label>
				<Form.Control
					autoComplete='address-line3'
					value={user.addressLine3}
					onChange={(e) => setUser({ ...user, addressLine3: e.target.value })}
				/>
			</Form.Group>
			<Form.Group>
				<Form.Label>Postcode</Form.Label>
				<Form.Control placeholder={postcode} readOnly />
				<Form.Text muted>
					This was taken from the previous page and cannot be changed.
				</Form.Text>
			</Form.Group>
			<hr />
			<h2>Additional Information</h2>
			<Form.Group>
				<Form.Label>Special requests</Form.Label>
				<Form.Control
					as='textarea'
					rows={3}
					value={user.specialRequests}
					onChange={(e) =>
						setUser({ ...user, specialRequests: e.target.value })
					}
				/>
			</Form.Group>
			<Form.Group>
				<Form.Label>Discount code</Form.Label>
				<Form.Control disabled />
				<Form.Text muted>
					There are currently no active discount codes.
				</Form.Text>
			</Form.Group>
		</Form>
	)
}

export const getStaticProps: GetStaticProps<PageProps> = async () => {
	const loadedStripe = await loadStripe(process.env.TEST_STRIPE_TOKEN)
	console.log('loadedStr', loadedStripe)
	return {
		props: {
			stripePromise: loadedStripe,
		},
	}
}

export default Checkout
