import { useEffect, useState } from 'react'
import { Alert as BootstrapAlert, AlertProps } from 'react-bootstrap'

interface ComponentProps
	extends Omit<AlertProps, 'children' | 'onClose' | 'show' | 'variant'> {
	error: string
}

const Alert = ({ error, ...props }: ComponentProps) => {
	const [show, setShow] = useState(false)

	useEffect(() => {
		if (error && !show) setShow(true)
		if (!error) setShow(false)
	}, [error])

	return (
		<BootstrapAlert
			variant='danger'
			dismissible
			onClose={() => setShow(false)}
			show={show}
			{...props}
		>
			<BootstrapAlert.Heading>Error</BootstrapAlert.Heading>
			<p style={{ marginBottom: '0' }} data-testid='alert-message'>
				{error}
			</p>
		</BootstrapAlert>
	)
}

export default Alert
