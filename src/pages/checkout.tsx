import { CardElement, Elements } from '@stripe/react-stripe-js'
import { loadStripe, Stripe } from '@stripe/stripe-js'
import { GetStaticProps } from 'next'
import React from 'react'

interface PageProps {
	stripePromise: Stripe
}

const Checkout = ({ stripePromise }: PageProps) => {
	return (
		<Elements stripe={stripePromise}>
			<CardElement />
		</Elements>
	)
}

export const getStaticProps: GetStaticProps<PageProps> = async () => {
	const loadedStripe = await loadStripe(
		'pk_test_JJ1eMdKN0Hp4UFJ6kWXWO4ix00jtXzq5XG'
	)
	return {
		props: {
			stripePromise: loadedStripe,
		},
	}
}

export default Checkout
