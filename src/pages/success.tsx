import { GetServerSideProps } from 'next'
import React from 'react'
import { Button } from 'react-bootstrap'
import Stripe from 'stripe'

// TODO format total price as string
interface PageProps {
	totalPrice: number
}

const Success = ({ totalPrice }: PageProps) => {
	return (
		<div>
			<h1>Thank you!</h1>
			<h2>Your order for {totalPrice} has been accepted.</h2>
			<Button href='/'>Home</Button>
		</div>
	)
}

const redirectHome = () => ({
	redirect: {
		destination: '/',
		permanent: false,
	},
})

export const getServerSideProps: GetServerSideProps<PageProps> = async (
	context
) => {
	const {
		query: { session_id },
	} = context
	if (!session_id) {
		return redirectHome()
	} else {
		// TODO setup link with stripe https://stripe.com/docs/payments/checkout/custom-success-page
		const stripe = new Stripe(process.env.TEST_STRIPE_SECRET, {
			apiVersion: '2020-08-27',
		})
		try {
			const session = await stripe.checkout.sessions.retrieve(
				session_id as string
			)
			return {
				props: {
					totalPrice: session.amount_total,
				},
			}
		} catch (err) {
			return redirectHome()
		}
	}
}

export default Success
