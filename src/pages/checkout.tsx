import CheckoutForm from '@components/CheckoutForm'
import useCheckoutInformation from '@hooks/useCheckoutInformation'
import { GetServerSideProps } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'

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
	const [user, setUser] = useCheckoutInformation()

	useEffect(() => {
		try {
			const startDate = new Date(localStorage.getItem('startDate'))
			const endDate = new Date(localStorage.getItem('endDate'))
			const postcode = localStorage.getItem('postcode')
			if (!postcode || !startDate || !endDate) throw new Error('Invalid state.')
			else {
				setPostcode(postcode)
				setStartDate(startDate)
				setEndDate(endDate)
			}
		} catch (e) {
			router.push('/hire')
		}
	}, [])

	return (
		<div className='checkout-wrapper'>
			<Head>
				<title>Checkout</title>
			</Head>
			<CheckoutForm
				tubID={tubID}
				postcode={postcode}
				startDate={startDate}
				endDate={endDate}
				user={user}
				setUser={setUser}
			/>
		</div>
	)
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
