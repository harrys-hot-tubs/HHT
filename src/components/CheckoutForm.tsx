import CheckoutErrors from '@components/CheckoutErrors'
import SpinnerButton from '@components/SpinnerButton'
import { CheckoutInformation } from '@hooks/useCheckoutInformation'
import { BookingData } from '@pages/checkout'
import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js'
import { StripeError } from '@stripe/stripe-js'
import { CreateOrderRequest } from '@typings/api/Order'
import { BookingDB } from '@typings/db/Booking'
import { priceToString } from '@utils/stripe'
import axios, { AxiosResponse } from 'axios'
import { useRouter } from 'next/router'
import React, { FormEventHandler, useState } from 'react'
import { Col, Form } from 'react-bootstrap'
import { Stripe } from 'stripe'
import DiscountCodeField from './DiscountCodeField'

interface ComponentProps {
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
	price: number
	paymentIntent: Pick<Stripe.PaymentIntent, 'client_secret' | 'id'>
	bookingData: BookingData
	/**
	 * All other information about the customer needed to dispatch a hot tub to them.
	 */
	user: CheckoutInformation
	setUser: React.Dispatch<React.SetStateAction<CheckoutInformation>>
	updatePaymentIntent: (
		value: Pick<Stripe.PaymentIntent, 'client_secret' | 'id'>
	) => void
	updatePrice: React.Dispatch<React.SetStateAction<number>>
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
	postcode,
	startDate,
	endDate,
	price,
	paymentIntent,
	bookingData,
	user,
	setUser,
	updatePaymentIntent,
	updatePrice,
}: ComponentProps) => {
	const router = useRouter()
	const stripe = useStripe()
	const elements = useElements()
	const [validated, setValidated] = useState(false)
	const [loading, setLoading] = useState(false)
	const [cardComplete, setCardComplete] = useState(false)
	const [checkoutError, setCheckoutError] = useState<StripeError | string>(
		undefined
	)

	const handleSubmit: FormEventHandler<HTMLFormElement> = async (event) => {
		setLoading(true)
		const form = event.currentTarget
		event.preventDefault()
		event.stopPropagation()
		if (form.checkValidity() === false) {
			setValidated(true)
		} else {
			try {
				await createOrder(
					user,
					postcode,
					paymentIntent.id,
					bookingData.bookingID
				)
			} catch (error) {
				console.error(error.message)
				setCheckoutError(
					"Failed to create an order. Don't worry, we haven't charged you."
				)
				return setLoading(false)
			}

			const result = await stripe.confirmCardPayment(
				paymentIntent.client_secret,
				{
					payment_method: {
						card: elements.getElement(CardElement),
						billing_details: {
							name: user.firstName + ' ' + user.firstName,
							email: user.email,
							phone: user.telephoneNumber,
							address: {
								line1: user.addressLine1,
								line2: user.addressLine2,
								postal_code: postcode,
								country: 'GB',
							},
						},
					},
				}
			)

			if (result.error) {
				console.error('Checkout request failed.')
				setCheckoutError(result.error)
				return setLoading(false)
			} else {
				// Clear stale data from local storage.
				localStorage.removeItem('bookingData')
		localStorage.removeItem('paymentIntentSecret')
		localStorage.removeItem('tub')
		localStorage.removeItem('price')

				const intent = result.paymentIntent
				const { id } = intent
				if (intent.status === 'succeeded') {
					router.push(`/success?id=${id}`)
				} else {
					router.push(`/failure?id=${id}`)
				}
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
			role='main'
		>
			<div className='price-info'>
				<small>
					{' '}
					{startDate ? startDate.toLocaleDateString() : 'XX/XX/XXXX'} to{' '}
					{endDate ? endDate.toLocaleDateString() : 'XX/XX/XXXX'}
				</small>
				<h1 className='price' data-testid='price'>
					{price !== undefined ? priceToString(price * 100) : '£XXX.XX'}
				</h1>
			</div>
			<div style={{ marginTop: '1em' }} />
			<CheckoutErrors error={checkoutError} />
			<CardElement
				className='form-control'
				options={{
					hidePostalCode: true,
					style: {
						base: {
							fontSize: '16px',
							fontFamily: 'Segoe UI',
						},
					},
				}}
				onChange={(event) => {
					setCardComplete(event.complete)
				}}
			/>
			<DiscountCodeField
				paymentIntent={paymentIntent}
				updatePaymentIntent={updatePaymentIntent}
				updatePrice={updatePrice}
			/>
			<hr />
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
					onChange={(e) => setUser({ ...user, email: e.target.value.trim() })}
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
			<hr />

			<SpinnerButton
				disabled={
					!stripe || !elements || !paymentIntent?.client_secret || !cardComplete
				}
				status={loading}
				type='submit'
				activeText='Loading...'
				className='checkout-button'
			>
				Submit and Pay
			</SpinnerButton>
		</Form>
	)
}

/**
 * Sends a order creation request to the API.
 * @param user The information describing the customer making the booking request
 * @param postcode The postcode of the customer making the booking request
 * @param paymentIntentID The ID associated with the current customer.
 * @param bookingID The id of the booking created when the customer opened the checkout page.
 * @throws If the order creation fails on the server.
 */
const createOrder = async (
	user: CheckoutInformation,
	postcode: string,
	paymentIntentID: string,
	bookingID: BookingDB['booking_id']
) => {
	const res = await axios.post<CreateOrderRequest, AxiosResponse<any>>(
		'/api/orders',
		{
			booking_id: bookingID,
			paymentIntentID,
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
	)
	if (res.status !== 200) throw new Error('Order creation failed.')
}

export default CheckoutForm
