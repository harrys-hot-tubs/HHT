import useRefunds from '@hooks/useRefunds'
import { PopulatedOrder } from '@typings/db/Order'
import { PopulatedRefund, RefundDB } from '@typings/db/Refund'
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import SpinnerButton from './SpinnerButton'

interface ComponentProps {
	orders: PopulatedOrder[]
}

const RefundManager = ({ orders }: ComponentProps) => {
	const [loading, setLoading] = useState(false)
	const { refunds: remoteRefunds, isLoading: refundsLoading } = useRefunds()
	const [refunds, setRefunds] = useState<PopulatedRefund[]>(
		populateRefunds(
			remoteRefunds?.filter((refund) => !refund.settled),
			orders
		)
	)

	useEffect(() => {
		setRefunds(
			populateRefunds(
				remoteRefunds?.filter((refund) => !refund.settled),
				orders
			)
		)
	}, [remoteRefunds])

	const settleRefund = async ({ order: { id } }: PopulatedRefund) => {
		setLoading(true)
		try {
			const body: Pick<RefundDB, 'settled'> = { settled: true }
			await axios.post(`/api/refunds/${id}`, body)
			setRefunds(refunds.filter((refund) => refund.order.id !== id))
		} catch (error) {
			console.error(error)
			console.warn(`Could not settle refund ${id}`)
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className='refund-manager'>
			<h2>Refund Manager</h2>
			<p>Settle refunds as they arrive.</p>
			{refunds?.length > 0 ? (
				refunds.map((refund) => (
					<div key={refund.order.id} className='card refund'>
						<h5>
							{refund.order.first_name} {refund.order.last_name}
						</h5>
						<small>{refund.damaged ? 'Damage Incurred' : 'No Damage'}</small>
						<br />
						{refund.damage_information ? (
							<p>{refund.damage_information}</p>
						) : null}
						<SpinnerButton
							activeText='Settling...'
							status={loading}
							onClick={(event) => {
								event.preventDefault()
								settleRefund(refund)
							}}
						>
							Refund Settled
						</SpinnerButton>
					</div>
				))
			) : (
				<h5>All refunds settled.</h5>
			)}
		</div>
	)
}

const populateRefunds = (
	refunds: RefundDB[],
	orders: PopulatedOrder[]
): PopulatedRefund[] => {
	return refunds?.map(
		(refund): PopulatedRefund => ({
			...refund,
			order: orders.filter((order) => order.id === refund.order_id)[0],
		})
	)
}

export default RefundManager
