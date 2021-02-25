import useCheckoutInformation from '@hooks/useCheckoutInformation'
import moment from 'moment'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import CheckoutForm from '../components/CheckoutForm'

interface PageProps {
	tubID: number
}

const Checkout = ({ tubID }: PageProps) => {
	const router = useRouter()

	const [postcode, setPostcode] = useState<string>('')
	const [startDate, setStartDate] = useState<moment.Moment>(null)
	const [endDate, setEndDate] = useState<moment.Moment>(null)
	const [user, setUser] = useCheckoutInformation()

	useEffect(() => {
		const startDate = moment(localStorage.getItem('startDate'))
		const endDate = moment(localStorage.getItem('endDate'))
		const postcode = localStorage.getItem('postcode')
		if (!postcode || !startDate || !endDate) router.push('/hire')
		else {
			setPostcode(postcode)
			setStartDate(startDate)
			setEndDate(endDate)
		}
	}, [])

	return (
		<div className='checkout-wrapper'>
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
