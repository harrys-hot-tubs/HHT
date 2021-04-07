import handleSSAuth from '@utils/SSAuth'
import { GetServerSideProps } from 'next'
import React from 'react'
import LogoutButton from '../components/LogoutButton'

interface PageProps {
	name: string
}

const Secure = ({ name }: PageProps) => {
	return (
		<div>
			<h1>This page is secure, {name}</h1>
			<LogoutButton />
		</div>
	)
}

export const getServerSideProps: GetServerSideProps<PageProps> = async (
	context
) => {
	const status = handleSSAuth(context, ['admin'])

	if (!status.isValid)
		return {
			redirect: {
				destination: '/login',
				permanent: false,
			},
		}

	return { props: { name: status.payload.first_name } }
}

export default Secure
