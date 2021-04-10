import ManagerDashboard from '@components/dashboards/ManagerDashboard'
import { Role } from '@typings/db/Account'
import handleSSAuth from '@utils/SSAuth'
import { GetServerSideProps } from 'next'
import Head from 'next/head'
import React from 'react'

interface PageProps {
	roles: Role[]
}

const Dashboard = ({ roles }: PageProps) => {
	// Role priority order: Admin, Manager, Driver, Customer

	const pickDashboard = () => {
		if (roles.includes('manager')) {
			return <ManagerDashboard />
		} else {
			return <h1>No dashboard for you yet.</h1>
		}
	}

	return (
		<div style={{ backgroundColor: 'white' }}>
			<Head>
				<title>Dashboard</title>
			</Head>
			{pickDashboard()}
		</div>
	)
}

export const getServerSideProps: GetServerSideProps<PageProps> = async (
	context
) => {
	const status = handleSSAuth(context, ['*'])
	if (!status.isValid)
		return {
			redirect: {
				destination: '/login',
				permanent: false,
			},
		}

	return {
		props: {
			roles: status.payload.account_roles,
		},
	}
}

export default Dashboard
