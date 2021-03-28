import useConsent from '@hooks/useConsent'
import React, { useEffect, useState } from 'react'
import { Button, Modal } from 'react-bootstrap'

const CookieConsentModal = () => {
	const [consent, setConsent] = useConsent()

	useEffect(() => {
		setShow(consent === undefined)
	}, [consent])

	const [show, setShow] = useState(false)

	const onAccept: React.MouseEventHandler<HTMLElement> = (e) => {
		setConsent(true)
		setShow(false)
		;(async () => {
			const ReactPixel = (await import('react-facebook-pixel')).default
			ReactPixel.grantConsent()
			ReactPixel.track('PageView')
		})()
	}

	const onReject: React.MouseEventHandler<HTMLElement> = (e) => {
		setConsent(false)
		setShow(false)
	}

	return (
		<Modal show={show} centered>
			<Modal.Header>
				<Modal.Title>Cookies</Modal.Title>
			</Modal.Header>

			<Modal.Body>
				<p>
					We use necessary cookies to make our site work. We'd also like to set
					optional analytics cookies to help us improve it. We won't set
					optional cookies unless you enable them. Using this tool will set a
					cookie on your device to remember your preferences.
				</p>
			</Modal.Body>

			<Modal.Footer>
				<Button variant='primary' onClick={onAccept}>
					Accept
				</Button>
				<Button variant='secondary' onClick={onReject}>
					Reject
				</Button>
			</Modal.Footer>
		</Modal>
	)
}

export default CookieConsentModal
