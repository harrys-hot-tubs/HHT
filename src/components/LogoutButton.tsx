import SpinnerButton from '@components/SpinnerButton'
import Cookies from 'js-cookie'
import { useRouter } from 'next/router'
import React, { MouseEventHandler, useState } from 'react'

/**
 * Button that can be used from anywhere that logs the currently logged in user out.
 */
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
