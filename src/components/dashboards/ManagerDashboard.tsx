import RecentlyFulfilled from '@components/RecentlyFulfilled'
import RefundManager from '@components/RefundManager'
import UpcomingOrders from '@components/UpcomingOrders'
import useOrders from '@hooks/useOrders'
import React from 'react'

/**
 * Dashboard to be used by managers to identify deliveries expected to be made in the future, and handle refunds.
 */
const ManagerDashboard = () => {
	const { orders, isLoading } = useOrders()

	if (isLoading) return <h1 data-testid='loading-indicator'>Loading...</h1>

	return (
		<div className='outer manager-dashboard'>
			<main>
				<h1>Dashboard</h1>
				<p>
					From here refunds can be managed and tabs can be kept on the state of
					every order.
				</p>
				<div className='manager'>
					<RefundManager orders={orders} />
					<UpcomingOrders orders={orders} />
				</div>
			</main>
			<aside>
				<RecentlyFulfilled orders={orders} />
			</aside>
		</div>
	)
}

export default ManagerDashboard
