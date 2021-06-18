import CheckoutForm from '@components/CheckoutForm'
import useCheckoutInformation from '@hooks/useCheckoutInformation'
import useStoredState from '@hooks/useStoredState'
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
import { GetServerSideProps } from 'next'
import Head from 'next/head'
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
	const [price, setPrice] = useState<number>(undefined)
	const [paymentIntent, setPaymentIntent] =
		useState<Pick<Stripe.PaymentIntent, 'client_secret' | 'id'>>(undefined)
	const [bookingData, setBookingData] = useStoredState<BookingData>({
		fallback: undefined,
		key: 'bookingData',
		toString: (v) => JSON.stringify(v),
		fromString: (v) => JSON.parse(v),
	})
	const [user, setUser] = useCheckoutInformation()

	useEffect(() => {
		try {
			const startDate = new Date(localStorage.getItem('startDate'))
			const endDate = new Date(localStorage.getItem('endDate'))
			const postcode = localStorage.getItem('postcode')
			if (!postcode || !startDate || !endDate) throw new Error('Invalid state.')
			else {
				;(async () => {
					if (startDate && endDate && tubID) {
						try {
							const price = await getPrice(
								startDate.toISOString(),
								endDate.toISOString(),
								tubID
							)
							setPrice(price)

							const secret = await getPaymentIntentSecret(
								startDate.toISOString(),
								endDate.toISOString(),
								tubID
							)
							setPaymentIntent(secret)
						} catch (error) {
							console.error(error.message)
							router.push('/hire')
						}
					}
				})()
				setPostcode(postcode)
				setStartDate(startDate)
				setEndDate(endDate)
			}
		} catch (error) {
			console.error(error.message)
			router.push('/hire')
		}
	}, [])

	useEffect(() => {
		if (tubID && startDate && endDate) {
			;(async () => {
				try {
					if (bookingData === undefined) {
						const bookingData = await reserveBooking(
							startDate.toISOString(),
							endDate.toISOString(),
							tubID
						)
						setBookingData({ ...bookingData, startTime: new Date() })
					}
				} catch (error) {
					console.error(error.message)
					router.push('/hire')
				}
			})()
		}
	}, [tubID, startDate, endDate, bookingData])

	return (
		<div className='checkout-wrapper'>
			<Head>
				<title>Checkout</title>
			</Head>

			<Elements stripe={getStripe()}>
				<CheckoutForm
					tubID={tubID}
					postcode={postcode}
					startDate={startDate}
					endDate={endDate}
					bookingData={bookingData}
					price={price}
					paymentIntent={paymentIntent}
					user={user}
					setUser={setUser}
				/>
			</Elements>
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
	startDate: string,
	endDate: string,
	id: number
): Promise<number> => {
	const res = await axios.post<PriceRequest, AxiosResponse<PriceResponse>>(
		`api/tubs/${id}`,
		{
			startDate,
			endDate,
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
	startDate: string,
	endDate: string,
	id: number
): Promise<Pick<Stripe.PaymentIntent, 'client_secret' | 'id'>> => {
	const res = await axios.post<
		PaymentIntentRequest,
		AxiosResponse<Pick<Stripe.PaymentIntent, 'client_secret' | 'id'>>
	>('/api/payments', {
		startDate,
		endDate,
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
	startDate: string,
	endDate: string,
	id: number
): Promise<CreateBookingSuccess> => {
	try {
		const res = await axios.post<
			CreateBookingRequest,
			AxiosResponse<CreateBookingResponse>
		>('/api/bookings', {
			startDate,
			endDate,
			tubID: id,
			expiryTime: 10,
		})
		if (res.status !== 200) throw new Error('Booking reservation failed.')
		if (res.data.error === false) return res.data
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
				destination: '/hire',
				permanent: false,
			},
		}
}

export default Checkout
