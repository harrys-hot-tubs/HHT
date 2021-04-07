import SpinnerButton from '@components/SpinnerButton'
import Cookies from 'js-cookie'
import { useRouter } from 'next/router'
import React, { MouseEventHandler, useState } from 'react'

const LogoutButton = () => {
	const [loading, setLoading] = useState<boolean>(false)
	const router = useRouter()

	const handleLogout: MouseEventHandler<HTMLButtonElement> = (event) => {
		setLoading(true)
		Cookies.remove('token')
		router.push('/login')
	}

	return (
		<SpinnerButton
			type='button'
			activeText='Logging out...'
			status={loading}
			onClick={handleLogout}
		>
			Logout
		</SpinnerButton>
	)
}

export default LogoutButton
