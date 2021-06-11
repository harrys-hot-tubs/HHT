import SpinnerButton from '@components/SpinnerButton'
import { CheckoutInformation } from '@hooks/useCheckoutInformation'
import {
	CheckoutRequest,
	PriceRequest,
	PriceResponse,
} from '@typings/api/Checkout'
import { CreateOrderRequest } from '@typings/api/Order'
import { getStripe } from '@utils/stripe'
import axios from 'axios'
import React, { FormEventHandler, useState } from 'react'
import { Col, Form } from 'react-bootstrap'
import Stripe from 'stripe'

interface ComponentProps {
	/**
	 * The tubID that the customer is booking.
	 */
	tubID: number
	/**
	 * The postcode the customer will have their booking sent to.
	 */
	postcode: string
	/**
	 * The start date of the customer's booking.
	 */
	startDate: Date
	/**
	 * The end date of the customer's booking.
	 */
	endDate: Date
	/**
	 * All other information about the customer needed to dispatch a hot tub to them.
	 */
	user: CheckoutInformation
	setUser: React.Dispatch<React.SetStateAction<CheckoutInformation>>
}

export const RefereeOptions = [
	'Facebook',
	'Instagram',
	'Recommendation',
	'Influencer - Please Enter Name!',
	'Search Engine',
	'Other',
]

/**
 * The form the customer must fill out in order to complete their booking.
 */
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
			const price = await getPrice(
				startDate.toISOString(),
				endDate.toISOString(),
				tubID
			)

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
			noValidate={true}
			validated={validated}
			onSubmit={handleSubmit}
			className='checkout-form'
			role='main'
		>
			<h1>Checkout</h1>
			<h2>Contact Details</h2>
			<Form.Row>
				<Form.Group as={Col}>
					<Form.Label>First name</Form.Label>
					<Form.Control
						aria-label='first-name'
						required
						autoComplete='given-name'
						value={user.firstName}
						onChange={(e) =>
							setUser({
								...user,
								firstName: e.target.value,
							})
						}
						aria-describedby='first-name-error'
					/>
					<Form.Control.Feedback
						type='invalid'
						id='first-name-error'
						role='alert'
					>
						This field is required.
					</Form.Control.Feedback>
				</Form.Group>
				<Form.Group as={Col}>
					<Form.Label>Last name</Form.Label>
					<Form.Control
						aria-label='last-name'
						required
						autoComplete='family-name'
						value={user.lastName}
						onChange={(e) =>
							setUser({
								...user,
								lastName: e.target.value,
							})
						}
						aria-describedby='last-name-error'
					/>
					<Form.Control.Feedback
						type='invalid'
						id='last-name-error'
						role='alert'
					>
						This field is required.
					</Form.Control.Feedback>
				</Form.Group>
			</Form.Row>
			<Form.Group>
				<Form.Label>Email address</Form.Label>
				<Form.Control
					aria-label='email'
					required
					autoComplete='email'
					value={user.email}
					onChange={(e) => setUser({ ...user, email: e.target.value })}
					aria-describedby='email-error'
				/>
				<Form.Control.Feedback type='invalid' id='email-error' role='alert'>
					This field is required.
				</Form.Control.Feedback>
			</Form.Group>
			<Form.Group>
				<Form.Label>Telephone number</Form.Label>
				<Form.Control
					aria-label='telephone'
					required
					autoComplete='tel'
					value={user.telephoneNumber}
					onChange={(e) =>
						setUser({ ...user, telephoneNumber: e.target.value })
					}
					aria-describedby='telephone-error'
				/>
				<Form.Control.Feedback type='invalid' id='telephone-error' role='alert'>
					This field is required.
				</Form.Control.Feedback>
			</Form.Group>
			<hr />
			<h2>Address</h2>
			<Form.Group>
				<Form.Label>Address line 1</Form.Label>
				<Form.Control
					aria-label='address1'
					required
					autoComplete='address-line1'
					value={user.addressLine1}
					onChange={(e) => setUser({ ...user, addressLine1: e.target.value })}
					aria-describedby='address-line1-error'
				/>
				<Form.Control.Feedback
					type='invalid'
					id='address-line1-error'
					role='alert'
				>
					This field is required.
				</Form.Control.Feedback>
			</Form.Group>
			<Form.Group>
				<Form.Label>Address line 2</Form.Label>
				<Form.Control
					aria-label='address2'
					required
					autoComplete='address-line2'
					value={user.addressLine2}
					onChange={(e) => setUser({ ...user, addressLine2: e.target.value })}
					aria-describedby='address-line2-error'
				/>
				<Form.Control.Feedback
					type='invalid'
					id='address-line2-error'
					role='alert'
				>
					This field is required.
				</Form.Control.Feedback>
			</Form.Group>
			<Form.Group>
				<Form.Label>Address line 3</Form.Label>
				<Form.Control
					aria-label='address3'
					required
					autoComplete='address-line3'
					value={user.addressLine3}
					onChange={(e) => setUser({ ...user, addressLine3: e.target.value })}
					aria-describedby='address-line3-error'
				/>
				<Form.Control.Feedback
					type='invalid'
					id='address-line3-error'
					role='alert'
				>
					This field is required.
				</Form.Control.Feedback>
			</Form.Group>
			<Form.Group>
				<Form.Label>Postcode</Form.Label>
				<Form.Control
					aria-label='postcode'
					required
					placeholder={postcode}
					readOnly
				/>
				<Form.Text muted>
					This was taken from the previous page and cannot be changed.
				</Form.Text>
			</Form.Group>
			<hr />
			<h2>Additional Information</h2>
			<Form.Group>
				<Form.Label>Where did you hear about us?</Form.Label>
				<Form.Control
					aria-label='referee'
					required
					list='referees'
					value={user.referee}
					onChange={(e) => setUser({ ...user, referee: e.target.value })}
					aria-describedby='referee-error'
				/>
				<datalist id='referees' data-testid='referees'>
					{RefereeOptions.map((referee, index) => (
						<option key={index}>{referee}</option>
					))}
				</datalist>
				<Form.Control.Feedback type='invalid' id='referee-error' role='alert'>
					This field is required.
				</Form.Control.Feedback>
			</Form.Group>
			<Form.Group>
				<Form.Label>Special requests</Form.Label>
				<Form.Control
					aria-label='requests'
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
						aria-label='start-date'
						required
						disabled
						placeholder={startDate ? startDate.toLocaleDateString() : null}
					/>
				</Form.Group>
				<Form.Group as={Col}>
					<Form.Label>End date</Form.Label>
					<Form.Control
						aria-label='end-date'
						required
						disabled
						placeholder={endDate ? endDate.toLocaleDateString() : null}
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

/**
 * Fetches the current price of booking a hot tub.
 * @param startDate The start date of the customer's booking.
 * @param endDate The end date of the customer's booking.
 * @param id The id of the tub the customer is booking.
 * @returns The price of booking the tub from the start date until the end date.
 */
const getPrice = async (
	startDate: string,
	endDate: string,
	id: number
): Promise<number> => {
	const params: PriceRequest = {
		startDate,
		endDate,
	}
	const res = await axios.post<PriceResponse>(`api/tubs/${id}`, params)
	if (res.status !== 200) throw new Error('Malformed price request.')
	else return res.data.price
}

/**
 * Sends a order creation request to the API.
 * @param user The information describing the customer making the booking request
 * @param postcode The postcode of the customer making the booking request
 * @param startDate The start date of the customer's booking
 * @param endDate The end date of the customer's booking.
 * @param checkoutSessionID The id of the stripe checkout session associated with this booking request
 * @param tubID The id of the tub the customer is booking.
 * @throws If the order creation fails on the server.
 */
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
