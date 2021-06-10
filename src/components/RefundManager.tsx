import useRefunds from '@hooks/useRefunds'
import { PopulatedOrder } from '@typings/db/Order'
import { PopulatedRefund, RefundDB } from '@typings/db/Refund'
import axios, { AxiosResponse } from 'axios'
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
			const { data: res } = await axios.post<
				Pick<RefundDB, 'settled'>,
				AxiosResponse<{ updated: RefundDB[] }>
			>(`/api/refunds/${id}`, { settled: true })

			if (res.updated.length === 0) throw new Error(`Tub ${id} does not exist.`)

			setRefunds(refunds.filter((refund) => refund.order.id !== id))
		} catch (error) {
			console.error(error)
			console.warn(`Could not settle refund ${id}`)
		} finally {
			setLoading(false)
		}
	}

	refunds?.map((r) => {
		console.log(`r.damage_information`, r.damage_information)
	})

	return (
		<div className='refund-manager'>
			<h2>Refund Manager</h2>
			<p>Settle refunds as they arrive.</p>
			{refunds?.length > 0 ? (
				refunds.map((refund) => (
					<div key={refund.order.id} className='card refund'>
						<h5 data-testid='customer-name'>
							{refund.order.first_name} {refund.order.last_name}
						</h5>
						<small data-testid='damage-status'>
							{refund.damaged ? 'Damage Incurred' : 'No Damage'}
						</small>
						<br />
						{refund.damage_information ? (
							<p data-testid='damage-details'>{refund.damage_information}</p>
						) : null}
						<SpinnerButton
							data-testid='settle-button'
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
