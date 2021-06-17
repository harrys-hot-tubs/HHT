import FacebookIcon from '@components/icons/FacebookIcon'
import InstagramIcon from '@components/icons/InstagramIcon'
import { priceToString } from '@utils/stripe'
import { GetServerSideProps } from 'next'
import Head from 'next/head'
import React from 'react'
import Stripe from 'stripe'

interface PageProps {
	totalPrice: string
}

/**
 * Page displayed to the customer when their order is processed successfully.
 */
const Success = ({ totalPrice }: PageProps) => {
	return (
		<div className='success-container'>
			<Head>
				<title>Successful Payment</title>
			</Head>
			<div>
				<h1>Thank you!</h1>
				<h3>Your order for {totalPrice} has been accepted and confirmed.</h3>
				<p>
					A member of the team will be in touch with you within 48 hours of the
					delivery date to give you an accurate delivery time!
				</p>
				<div className='exit-card'>
					<h3>Check out our social media:</h3>
					<div className='social-media'>
						<FacebookIcon />
						<InstagramIcon />
					</div>
					<hr />
					<span className='home-text'>
						Back to{' '}
						<a href='/' className='home-link' role='link' aria-label='home'>
							home
						</a>
						.
					</span>
				</div>
			</div>
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
		query: { id },
	} = context
	if (!id) {
		return redirectHome()
	} else {
		const stripe = new Stripe(process.env.STRIPE_SECRET, {
			apiVersion: '2020-08-27',
		})
		try {
			const intent = await stripe.paymentIntents.retrieve(id as string)
			return {
				props: {
					totalPrice: priceToString(intent.amount),
				},
			}
		} catch (err) {
			return redirectHome()
		}
	}
}

export default Success
