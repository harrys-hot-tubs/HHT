import DriverDashboard from '@components/dashboards/DriverDashboard'
import ManagerDashboard from '@components/dashboards/ManagerDashboard'
import { AccountDB, Role } from '@typings/db/Account'
import handleSSAuth from '@utils/SSAuth'
import { GetServerSideProps } from 'next'
import Head from 'next/head'
import React from 'react'

interface PageProps {
	account: Omit<AccountDB, 'password_hash'>
}

const Dashboard = ({ account }: PageProps) => {
	const pickDashboard = () => {
		const primaryRole = extractPrimaryRole(account.account_roles)
		switch (primaryRole) {
			case 'manager':
				return <ManagerDashboard />
			case 'driver':
				return <DriverDashboard id={account.account_id} />
			default:
				return <h1>No dashboard for you yet.</h1>
		}
	}

	return (
		<React.Fragment>
			<Head>
				<title>Dashboard</title>
			</Head>
			{pickDashboard()}
		</React.Fragment>
	)
}

export const extractPrimaryRole = (roles: Role[]): Role => {
	// Role priority order: Admin, Manager, Driver, Customer
	if (roles.includes('admin')) {
	} else if (roles.includes('manager')) {
		return 'manager'
	} else if (roles.includes('driver')) {
		return 'driver'
	} else if (roles.includes('customer')) {
		return 'customer'
	}
}

export const getServerSideProps: GetServerSideProps<PageProps> = async (
	context
) => {
	const status = await handleSSAuth(context, ['*'])
	if (!status.authorised)
		return {
			redirect: {
				destination: '/login',
				permanent: false,
			},
		}

	return {
		props: {
			account: status.payload,
		},
	}
}

export default Dashboard
