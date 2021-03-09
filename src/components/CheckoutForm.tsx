import SpinnerButton from '@components/SpinnerButton'
import { CheckoutInformation } from '@hooks/useCheckoutInformation'
import {
	CheckoutRequest,
	PriceRequest,
	PriceResponse,
} from '@typings/api/Checkout'
import { CreateOrderRequest } from '@typings/api/Order'
import { momentToString } from '@utils/date'
import { getStripe } from '@utils/stripe'
import axios from 'axios'
import React, { FormEventHandler, useState } from 'react'
import { Col, Form } from 'react-bootstrap'
import Stripe from 'stripe'

interface ComponentProps {
	tubID: number
	postcode: string
	startDate: moment.Moment
	endDate: moment.Moment
	user: CheckoutInformation
	setUser: React.Dispatch<React.SetStateAction<CheckoutInformation>>
}

const CheckoutForm = ({
	tubID,
	postcode,
	startDate,
	endDate,
	user,
	setUser,
}: ComponentProps) => {
	const [validated, setValidated] = useState(false)
	const [loading, setLoading] = useState(false)

	const handleSubmit: FormEventHandler<HTMLFormElement> = async (event) => {
		setLoading(true)
		const form = event.currentTarget
		event.preventDefault()
		event.stopPropagation()
		if (form.checkValidity() === false) {
			setValidated(true)
		} else {
			const price = await getPrice({
				id: tubID,
				startDate: startDate.toISOString(),
				endDate: endDate.toISOString(),
			})

			const params: CheckoutRequest = {
				price,
				startDate: startDate.toISOString(),
				endDate: endDate.toISOString(),
			}

			const res = await axios.post<Stripe.Checkout.Session>(
				'/api/checkout_sessions',
				params
			)

			if (res.status !== 200) {
				console.error('Checkout request failed.')
				setLoading(false)
				return
			} else {
				const { id } = res.data
				try {
					await createOrder(
						user,
						postcode,
						startDate.toISOString(),
						endDate.toISOString(),
						id,
						tubID
					)
				} catch (error) {
					setLoading(false)
					return
				}

				const stripe = await getStripe()
				const { error } = await stripe!.redirectToCheckout({
					sessionId: id,
				})

				console.warn(error.message)
			}
		}

		setLoading(false)
	}

	return (
		<Form
			noValidate
			validated={validated}
			onSubmit={handleSubmit}
			className='checkout-form'
		>
			<h1>Checkout</h1>
			<h2>Contact Details</h2>
			<Form.Row>
				<Form.Group as={Col}>
					<Form.Label>First name</Form.Label>
					<Form.Control
						required
						autoComplete='given-name'
						value={user.firstName}
						onChange={(e) =>
							setUser({
								...user,
								firstName: e.target.value,
							})
						}
					/>
					<Form.Control.Feedback type='invalid'>
						This field is required.
					</Form.Control.Feedback>
				</Form.Group>
				<Form.Group as={Col}>
					<Form.Label>Last name</Form.Label>
					<Form.Control
						required
						autoComplete='family-name'
						value={user.lastName}
						onChange={(e) =>
							setUser({
								...user,
								lastName: e.target.value,
							})
						}
					/>
					<Form.Control.Feedback type='invalid'>
						This field is required.
					</Form.Control.Feedback>
				</Form.Group>
			</Form.Row>
			<Form.Group>
				<Form.Label>Email address</Form.Label>
				<Form.Control
					required
					autoComplete='email'
					value={user.email}
					onChange={(e) => setUser({ ...user, email: e.target.value })}
				/>
				<Form.Control.Feedback type='invalid'>
					This field is required.
				</Form.Control.Feedback>
			</Form.Group>
			<Form.Group>
				<Form.Label>Telephone number</Form.Label>
				<Form.Control
					required
					autoComplete='tel'
					value={user.telephoneNumber}
					onChange={(e) =>
						setUser({ ...user, telephoneNumber: e.target.value })
					}
				/>
				<Form.Control.Feedback type='invalid'>
					This field is required.
				</Form.Control.Feedback>
			</Form.Group>
			<hr />
			<h2>Address</h2>
			<Form.Group>
				<Form.Label>Address line 1</Form.Label>
				<Form.Control
					required
					autoComplete='address-line1'
					value={user.addressLine1}
					onChange={(e) => setUser({ ...user, addressLine1: e.target.value })}
				/>
				<Form.Control.Feedback type='invalid'>
					This field is required.
				</Form.Control.Feedback>
			</Form.Group>
			<Form.Group>
				<Form.Label>Address line 2</Form.Label>
				<Form.Control
					required
					autoComplete='address-line2'
					value={user.addressLine2}
					onChange={(e) => setUser({ ...user, addressLine2: e.target.value })}
				/>
				<Form.Control.Feedback type='invalid'>
					This field is required.
				</Form.Control.Feedback>
			</Form.Group>
			<Form.Group>
				<Form.Label>Address line 3</Form.Label>
				<Form.Control
					required
					autoComplete='address-line3'
					value={user.addressLine3}
					onChange={(e) => setUser({ ...user, addressLine3: e.target.value })}
				/>
				<Form.Control.Feedback type='invalid'>
					This field is required.
				</Form.Control.Feedback>
			</Form.Group>
			<Form.Group>
				<Form.Label>Postcode</Form.Label>
				<Form.Control required placeholder={postcode} readOnly />
				<Form.Text muted>
					This was taken from the previous page and cannot be changed.
				</Form.Text>
			</Form.Group>
			<hr />
			<h2>Additional Information</h2>
			<Form.Group>
				<Form.Label>Where did you hear about us?</Form.Label>
				<Form.Control
					required
					list='referees'
					value={user.referee}
					onChange={(e) => setUser({ ...user, referee: e.target.value })}
				/>
				<datalist id='referees'>
					<option>Facebook</option>
					<option>Instagram</option>
					<option>Recommendation</option>
					<option>Influencer - Please Enter Name!</option>
					<option>Search Engine</option>
					<option>Other</option>
				</datalist>
				<Form.Control.Feedback type='invalid'>
					This field is required.
				</Form.Control.Feedback>
			</Form.Group>
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
			<Form.Row>
				<Form.Group as={Col}>
					<Form.Label>Start date</Form.Label>
					<Form.Control
						required
						disabled
						placeholder={momentToString(startDate)}
					/>
				</Form.Group>
				<Form.Group as={Col}>
					<Form.Label>End date</Form.Label>
					<Form.Control
						required
						disabled
						placeholder={momentToString(endDate)}
					/>
				</Form.Group>
			</Form.Row>
			<Form.Text muted>
				These dates were taken from the previous page and cannot be changed.
			</Form.Text>
			<SpinnerButton
				status={loading}
				type='submit'
				activeText='Loading...'
				className='checkout-button'
			>
				Submit
			</SpinnerButton>
		</Form>
	)
}

const getPrice = async ({
	startDate,
	endDate,
	id,
}: {
	startDate: string
	endDate: string
	id: number
}): Promise<number> => {
	const params: PriceRequest = {
		startDate,
		endDate,
	}
	const res = await axios.post<PriceResponse>(`api/tubs/${id}`, params)
	if (res.status !== 200) throw new Error('Malformed price request.')
	else return res.data.price
}

const createOrder = async (
	user: CheckoutInformation,
	postcode: string,
	startDate: string,
	endDate: string,
	checkoutSessionID: string,
	tubID: number
) => {
	const params: CreateOrderRequest = {
		checkout_session_id: checkoutSessionID,
		tub_id: tubID,
		start_date: startDate,
		end_date: endDate,
		first_name: user.firstName,
		last_name: user.lastName,
		email: user.email,
		telephone_number: user.telephoneNumber,
		address_line_1: user.addressLine1,
		address_line_2: user.addressLine2,
		address_line_3: user.addressLine3,
		referee: user.referee,
		special_requests: user.specialRequests,
		postcode,
	}
	const res = await axios.post('/api/orders', params)
	if (res.status !== 200) throw new Error('Order creation failed.')
}

export default CheckoutForm
