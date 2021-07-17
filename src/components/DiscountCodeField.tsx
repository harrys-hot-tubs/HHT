import SpinnerButton from '@components/SpinnerButton'
import { useStripe } from '@stripe/react-stripe-js'
import { APIError } from '@typings/api/Error'
import { UpdatePaymentRequest } from '@typings/api/Payment'
import axios from 'axios'
import React, { MouseEventHandler, useState } from 'react'
import { Form, InputGroup } from 'react-bootstrap'
import { FeedbackProps } from 'react-bootstrap/esm/Feedback'
import Stripe from 'stripe'

interface ComponentProps {
	paymentIntent: Pick<Stripe.PaymentIntent, 'client_secret' | 'id'>
	updatePaymentIntent: (
		value: Pick<Stripe.PaymentIntent, 'client_secret' | 'id'>
	) => void
	updatePrice: React.Dispatch<React.SetStateAction<number>>
}

const DiscountCodeField = ({
	paymentIntent,
	updatePaymentIntent,
	updatePrice,
}: ComponentProps) => {
	const stripe = useStripe()
	const [discountCode, setDiscountCode] = useState('')
	const [feedback, setFeedback] = useState<{
		type?: FeedbackProps['type']
		message: string
		show: boolean
	}>({
		type: undefined,
		message: '',
		show: false,
	})
	const [loading, setLoading] = useState<boolean>(false)

	const onClick: MouseEventHandler<HTMLElement> = async (event) => {
		setFeedback({ ...feedback, show: false })
		setLoading(true)

		try {
			const data = await applyPromoCode(paymentIntent.id, discountCode)
			const newPaymentIntent = await stripe.retrievePaymentIntent(
				data.client_secret
			)

			updatePaymentIntent(data)
			updatePrice(newPaymentIntent.paymentIntent.amount / 100)
			setFeedback({
				type: 'valid',
				message: `Discount code ${discountCode} applied.`,
				show: true,
			})
			setLoading(false)
		} catch (error) {
			console.error(error.message)
			setFeedback({ type: 'invalid', message: error.message, show: true })
			setLoading(false)
		}
	}

	return (
		<Form.Group className='discount-code-group'>
			<InputGroup hasValidation>
				<Form.Control
					aria-label='discount-code'
					value={discountCode}
					onChange={(event) => setDiscountCode(event.target.value.trim())}
					placeholder='Discount Code'
					isInvalid={feedback.type === 'invalid'}
					isValid={feedback.type === 'valid'}
					aria-describedby='discount-code-feedback'
				/>
				<InputGroup.Append>
					<SpinnerButton
						activeText='Applying...'
						status={loading}
						onClick={onClick}
						data-testid='apply-discount-code-button'
					>
						Apply
					</SpinnerButton>
				</InputGroup.Append>
				<Form.Control.Feedback type={feedback.type} id='discount-code-feedback'>
					{feedback.message}
				</Form.Control.Feedback>
			</InputGroup>
		</Form.Group>
	)
}

const applyPromoCode = async (
	paymentIntentID: string,
	promoCode: string
): Promise<Pick<Stripe.PaymentIntent, 'client_secret' | 'id'>> => {
	const res = await axios.patch<
		Pick<Stripe.PaymentIntent, 'client_secret' | 'id'> | APIError
	>(
		`/api/payments`,
		{
			paymentIntentID,
			promoCode,
		} as UpdatePaymentRequest,
		{ validateStatus: (status) => status < 500 }
	)
	if (res.status !== 200) throw new Error((res.data as APIError).message)
	return res.data as Pick<Stripe.PaymentIntent, 'client_secret' | 'id'>
}

export default DiscountCodeField
