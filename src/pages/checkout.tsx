import BookingCountdownTimer, {
	deleteBookingReservation,
} from '@components/BookingCountdownTimer'
import CheckoutForm from '@components/CheckoutForm'
import { faAngleLeft } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import useCheckoutInformation from '@hooks/useCheckoutInformation'
import useStoredState from '@hooks/useStoredState'
import useStoredStateWithExpiration from '@hooks/useStoredStateWithExpiration'
import { Elements } from '@stripe/react-stripe-js'
import {
	CreateBookingRequest,
	CreateBookingResponse,
	CreateBookingSuccess,
} from '@typings/api/Bookings'
import {
	PaymentIntentRequest,
	PriceRequest,
	PriceResponse,
} from '@typings/api/Payment'
import { getStripe } from '@utils/stripe'
import axios, { AxiosResponse } from 'axios'
import { subMinutes } from 'date-fns'
import { isNumber } from 'lodash'
import { GetServerSideProps } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import Stripe from 'stripe'
export interface BookingData extends Omit<CreateBookingSuccess, 'error'> {
	startTime: Date
}
interface PageProps {
	tubID: number
}

/**
 * Page allowing customers to complete their purchase.
 */
const Checkout = ({ tubID }: PageProps) => {
	const router = useRouter()

	const [postcode, setPostcode] = useState<string>('')
	const [startDate, setStartDate] = useState<Date>(null)
	const [endDate, setEndDate] = useState<Date>(null)
	const [price, setPrice] = useStoredState<number>({
		fallback: undefined,
		key: 'price',
		fromString: (v) => Number(v),
		toString: (v) => v.toString(),
	})
	const [paymentIntent, setPaymentIntent] = useStoredState<
		Pick<Stripe.PaymentIntent, 'client_secret' | 'id'>
	>({
		fallback: undefined,
		key: 'paymentIntentSecret',
		fromString: JSON.parse,
		toString: JSON.stringify,
	})
	const [bookingData, setBookingData] = useStoredState<BookingData>({
		fallback: undefined,
		key: 'bookingData',
		toString: JSON.stringify,
		fromString: JSON.parse,
	})
	const [user, setUser] = useCheckoutInformation()
	const [viewers] = useStoredStateWithExpiration<number>({
		fallback: 2 + Math.ceil(Math.random() * 4),
		key: 'productViewers',
		isType: isNumber,
		ttl: 10 * 1000 * 60,
		fromString: (v) => Number(v),
		toString: (v) => v.toString(),
	})

	/**
	 * @description Removes all booking related data from local storage and redirects to the hire page.
	 */
	const cleanupAndRedirect = () => {
		localStorage.removeItem('bookingData')
		localStorage.removeItem('paymentIntentSecret')
		localStorage.removeItem('tub')
		localStorage.removeItem('price')
		router.push('/#book')
	}

	useEffect(() => {
		try {
			const startDate = new Date(localStorage.getItem('startDate'))
			const endDate = new Date(localStorage.getItem('endDate'))
			const postcode = localStorage.getItem('postcode')
			const price = Number(localStorage.getItem('price'))
			if (!postcode || !startDate || !endDate) {
				throw new Error('Invalid state.')
			} else {
				if (!price) {
					;(async () => {
						const price = await getPrice(startDate, endDate, tubID)
						setPrice(price)
					})()
				}
				setPrice(price)
				setPostcode(postcode)
				setStartDate(startDate)
				setEndDate(endDate)
			}
		} catch (error) {
			console.error(error.message)
			cleanupAndRedirect()
		}
	}, [])

	// Payment Intent Secret Loader
	useEffect(() => {
		if (tubID && startDate && endDate) {
			const storedPaymentIntentSecret: Pick<
				Stripe.PaymentIntent,
				'client_secret' | 'id'
			> = JSON.parse(localStorage.getItem('paymentIntentSecret'))
			if (!storedPaymentIntentSecret) {
				// Create a new payment intent
				getPaymentIntentSecret(startDate, endDate, tubID)
					.then((secret) => setPaymentIntent(secret))
					.catch((error) => {
						console.error(error.message)
						cleanupAndRedirect()
					})
			} else {
				// If payment intent secret is already stored, then it means that the data is valid.
				setPaymentIntent(storedPaymentIntentSecret)
			}
		}
	}, [tubID, startDate, endDate])

	// Booking Data Loader
	useEffect(() => {
		if (tubID && startDate && endDate) {
			const storedBookingData: BookingData = JSON.parse(
				localStorage.getItem('bookingData')
			)
			if (!storedBookingData) {
				reserveBooking(startDate, endDate, tubID)
					.then((newBooking) =>
						setBookingData({ ...newBooking, startTime: new Date() })
					)
					.catch((error) => {
						console.error(error.message)
						cleanupAndRedirect()
					})
			} else {
				if (storedBookingData.exp < new Date().getTime()) {
					console.error('Booking reservation expired')
					// If booking data has expired
					deleteBookingReservation(storedBookingData.bookingID).then(() => {
						reserveBooking(startDate, endDate, tubID)
							.then((newBooking) =>
								setBookingData({ ...newBooking, startTime: new Date() })
							)
							.catch((error) => {
								console.error(error.message)
								cleanupAndRedirect()
							})
					})
				} else {
					// If booking data is valid.
					setBookingData(storedBookingData)
				}
			}
		}
	}, [tubID, startDate, endDate])

	return (
		<div className='checkout-wrapper'>
			<Head>
				<title>Checkout</title>
			</Head>
			<div className='checkout-outer'>
				<span className='title-bar'>
					<BookingCountdownTimer
						bookingData={bookingData}
						cleanup={cleanupAndRedirect}
					/>
					<div>
						<h2 className='checkout-title'>Checkout</h2>
						<small>
							<strong suppressHydrationWarning>{viewers}</strong> people are
							looking at this.
						</small>
					</div>
					<Link href='/#book'>
						<div className='back-button'>
							<FontAwesomeIcon icon={faAngleLeft} /> Back
						</div>
					</Link>
				</span>
				<Elements stripe={getStripe()}>
					<CheckoutForm
						postcode={postcode}
						startDate={startDate}
						endDate={endDate}
						bookingData={bookingData}
						price={price}
						paymentIntent={paymentIntent}
						user={user}
						setUser={setUser}
						updatePaymentIntent={setPaymentIntent}
						updatePrice={setPrice}
					/>
				</Elements>
			</div>
		</div>
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
	startDate: Date,
	endDate: Date,
	id: number
): Promise<number> => {
	const res = await axios.post<PriceRequest, AxiosResponse<PriceResponse>>(
		`api/tubs/${id}`,
		{
			startDate: subMinutes(
				startDate,
				startDate.getTimezoneOffset()
			).toISOString(),
			endDate: subMinutes(endDate, endDate.getTimezoneOffset()).toISOString(),
		}
	)
	if (res.status !== 200) throw new Error('Malformed price request.')
	else return res.data.price
}

/**
 * Fetches the secret for a new payment intent.
 *
 * @param startDate The start date of the customer's booking.
 * @param endDate The end date of the customer's booking.
 * @param id The id of the tub the customer is booking.
 * @returns The secret associated with a newly created payment intent.
 */
const getPaymentIntentSecret = async (
	startDate: Date,
	endDate: Date,
	id: number
): Promise<Pick<Stripe.PaymentIntent, 'client_secret' | 'id'>> => {
	const res = await axios.post<
		PaymentIntentRequest,
		AxiosResponse<Pick<Stripe.PaymentIntent, 'client_secret' | 'id'>>
	>('/api/payments', {
		startDate: subMinutes(
			startDate,
			startDate.getTimezoneOffset()
		).toISOString(),
		endDate: subMinutes(endDate, endDate.getTimezoneOffset()).toISOString(),
		tubID: id,
	})
	if (res.status !== 200) throw new Error('Malformed price request.')
	else return res.data
}

/**
 * Reserves a booking for the customer.
 *
 * @param startDate The start date of the customer's booking.
 * @param endDate The end date of the customer's booking.
 * @param id The id of the tub the customer is booking.
 * @returns The booking_id and expiry time of the customer's reserved booking.
 */
const reserveBooking = async (
	startDate: Date,
	endDate: Date,
	id: number
): Promise<Omit<CreateBookingSuccess, 'error'>> => {
	try {
		const res = await axios.post<
			CreateBookingRequest,
			AxiosResponse<CreateBookingResponse>
		>('/api/bookings', {
			startDate: subMinutes(
				startDate,
				startDate.getTimezoneOffset()
			).toISOString(),
			endDate: subMinutes(endDate, endDate.getTimezoneOffset()).toISOString(),

			tubID: id,
			expiryTime: 10,
		})
		if (res.status !== 200) throw new Error('Booking reservation failed.')
		if (res.data.error === false)
			return {
				bookingID: res.data.bookingID,
				exp: res.data.exp,
			}
	} catch (error) {
		console.error(error.message)
		throw error
	}
}

export const getServerSideProps: GetServerSideProps<PageProps> = async (
	context
) => {
	const query = context.query
	const tub_id = Number(query.tub_id as string)
	if (tub_id) return { props: { tubID: tub_id } }
	else
		return {
			redirect: {
				destination: '/#book',
				permanent: false,
			},
		}
}

export default Checkout
