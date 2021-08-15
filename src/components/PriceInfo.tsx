import useStoredState from '@hooks/useStoredState'
import { useStripe } from '@stripe/react-stripe-js'
import { APIError } from '@typings/api/Error'
import { CashOnDeliveryRequest } from '@typings/api/Payment'
import { priceToString } from '@utils/stripe'
import axios from 'axios'
import { isNumber } from 'lodash'
import React, { useEffect, useState } from 'react'
import { Form, Spinner } from 'react-bootstrap'
import Stripe from 'stripe'

export interface ComponentProps {
	paymentIntent: Pick<Stripe.PaymentIntent, 'client_secret' | 'id'>
	updatePaymentIntent: (
		value: Pick<Stripe.PaymentIntent, 'client_secret' | 'id'>
	) => void
	updatePrice: React.Dispatch<React.SetStateAction<number>>
	startDate?: Date
	endDate?: Date
	price?: number
}

const PriceInfo = ({
	paymentIntent,
	updatePaymentIntent,
	updatePrice,
	startDate,
	endDate,
	price,
}: ComponentProps) => {
	const [totalPayment, setTotalPayment] = useStoredState<number>({
		key: 'totalPayment',
		fallback: price,
		fromString: JSON.parse,
		toString: JSON.stringify,
	})
	const [cashOnDelivery, setCashOnDelivery] = useStoredState<boolean>({
		key: 'cashOnDelivery',
		fallback: false,
		fromString: JSON.parse,
		toString: JSON.stringify,
	})
	const [loading, setLoading] = useState(false)
	const stripe = useStripe()

	useEffect(() => {
		if (
			totalPayment === undefined ||
			(totalPayment === 0 && isNumber(price) && cashOnDelivery === false)
		)
			setTotalPayment(price)
	}, [price])

	useEffect(() => {
		if (paymentIntent !== undefined)
			axios
				.get(`/api/payments/${paymentIntent?.id}`)
				.then(({ data: { metadata, amount } }) => {
					console.log(`data`, metadata)
					console.log(`price`, amount / 100)
					if (metadata?.remainder_to_be_paid) {
						if (metadata?.cash_on_delivery === 'true') {
							setTotalPayment(
								(Number(amount) + Number(metadata.remainder_to_be_paid)) / 100
							)
						} else {
							setTotalPayment(Number(amount) / 100)
						}
					}
				})
				.catch((err) => {
					console.error(err.message)
				})
	}, [paymentIntent])

	/**
	 * Updates the payment intent to reflect the user's desire to pay a deposit amount with the remainder paid on delivery.
	 */
	const onChange: React.ChangeEventHandler<HTMLInputElement> = async (
		_event
	) => {
		setLoading(true)
		try {
			const data = await toggleCashOnDelivery(paymentIntent.id, !cashOnDelivery)
			const newPaymentIntent = await stripe.retrievePaymentIntent(
				data.client_secret
			)

			updatePaymentIntent(data)
			updatePrice(newPaymentIntent.paymentIntent.amount / 100)

			setCashOnDelivery(!cashOnDelivery)
		} catch (error) {
			console.error(error.message)
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className='price-info'>
			<small>
				{' '}
				{startDate ? startDate.toLocaleDateString() : 'XX/XX/XXXX'} to{' '}
				{endDate ? endDate.toLocaleDateString() : 'XX/XX/XXXX'}
			</small>
			<h1 className='price' data-testid='price'>
				{price !== undefined ? priceToString(price * 100) : '£XXX.XX'}
			</h1>
			<Form.Group>
				<Form.Check
					data-testid='cash-on-delivery-button'
					disabled={loading}
					checked={cashOnDelivery}
					onChange={onChange}
					label={
						<span>
							Pay £
							<span data-testid='deposit'>
								{calculateDeposit(totalPayment).toLocaleString('en-GB', {
									maximumFractionDigits: 2,
									minimumFractionDigits: 0,
								})}
							</span>{' '}
							now and £
							<span data-testid='remainder'>
								{Number(
									totalPayment - calculateDeposit(totalPayment)
								).toLocaleString('en-GB', {
									maximumFractionDigits: 2,
									minimumFractionDigits: 0,
								})}
							</span>{' '}
							on delivery.
						</span>
					}
				/>
				{loading ? <Spinner animation='border' /> : null}
				{cashOnDelivery ? (
					<Form.Text className='deposit-info' data-testid='deposit-info'>
						Please note this booking deposit is non-refundable and the remaining
						balance is to be paid via bank transfer upon delivery.
					</Form.Text>
				) : null}
			</Form.Group>
		</div>
	)
}

/**
 * Calculates the deposit amount for the current transaction.
 *
 * @param {number} price The price of the transaction in £.
 * @returns {number} The deposit amount.
 */
export const calculateDeposit = (price: number): number =>
	price > 60 ? 60 : price * 0.8

const toggleCashOnDelivery = async (
	paymentIntentID: string,
	cashOnDelivery: boolean
) => {
	const res = await axios.patch<
		Pick<Stripe.PaymentIntent, 'client_secret' | 'id'> | APIError
	>(
		`/api/payments`,
		{
			type: 'CASH_ON_DELIVERY',
			paymentIntentID,
			cashOnDelivery,
		} as CashOnDeliveryRequest,
		{ validateStatus: (status) => status < 500 }
	)
	if (res.status !== 200) throw new Error((res.data as APIError).message)
	return res.data as Pick<Stripe.PaymentIntent, 'client_secret' | 'id'>
}

export default PriceInfo
