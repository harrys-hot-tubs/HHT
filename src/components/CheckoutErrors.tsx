import { StripeError } from '@stripe/stripe-js'
import React, { useEffect, useState } from 'react'
import { Alert } from 'react-bootstrap'

interface ComponentProps {
	error: StripeError | string
}

const CheckoutErrors = ({ error }: ComponentProps) => {
	const [show, setShow] = useState(false)

	useEffect(() => {
		if (error && !show) setShow(true)
	}, [error])

	return (
		<Alert
			data-testid='payment-alert'
			variant='danger'
			onClose={() => setShow(false)}
			dismissible
			show={show}
		>
			<Alert.Heading data-testid='payment-alert-heading'>
				{typeof error === 'string' ? 'Error' : 'Payment Failed'}
			</Alert.Heading>
			<p style={{ marginBottom: '0' }} data-testid='payment-alert-message'>
				{generateMessage(error)}
			</p>
		</Alert>
	)
}

const generateMessage = (error: StripeError | string): string => {
	if (typeof error === 'string') return error

	switch (error?.type) {
		case 'validation_error':
			return 'Your card details cannot be validated.'
		case 'api_connection_error':
		case 'api_error':
		case 'idempotency_error':
		case 'rate_limit_error':
			return 'There was an error when handing off your payment to be processed.'
		case 'authentication_error':
			return 'Improper authentication provided.'
		default:
			return error?.message
	}
}

export default CheckoutErrors
