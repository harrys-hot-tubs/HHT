import { GetServerSideProps } from 'next'
import React from 'react'
import { Button } from 'react-bootstrap'
import Stripe from 'stripe'
import FacebookIcon from '../components/FacebookIcon'
import InstagramIcon from '../components/InstagramIcon'

interface PageProps {
	totalPrice: string
}

const Success = ({ totalPrice }: PageProps) => {
	return (
		<div className='success-container'>
			<h1>Thank you!</h1>
			<h3>
				Your order for £{totalPrice} has been accepted and your order has been
				confirmed.
			</h3>
			<p>We will contact you soon to with an accurate delivery time.</p>
			<h3>In the meantime, check out our social media:</h3>
			<div className='social-media'>
				<FacebookIcon />
				<InstagramIcon />
			</div>

			<Button href='/' className='home-button'>
				Home
			</Button>
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
		const stripe = new Stripe(process.env.TEST_STRIPE_SECRET, {
			apiVersion: '2020-08-27',
		})
		try {
			const session = await stripe.checkout.sessions.retrieve(
				session_id as string
			)
			return {
				props: {
					totalPrice: priceToString(session.amount_total),
				},
			}
		} catch (err) {
			return redirectHome()
		}
	}
}

const priceToString = (price: number) => {
	const rawString = String(price)
	return rawString.slice(0, -2) + '.' + rawString.slice(-2)
}

export default Success
