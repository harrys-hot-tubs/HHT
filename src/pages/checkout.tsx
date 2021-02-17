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
	const loadedStripe = await loadStripe(process.env.STRIPE_TOKEN)
	console.log('loadedStr', loadStripe.name)
	return {
		props: {
			stripePromise: loadedStripe,
		},
	}
}

export default Checkout
