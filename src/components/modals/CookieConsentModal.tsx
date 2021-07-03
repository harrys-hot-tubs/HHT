import useConsent from '@hooks/useConsent'
import React, { useEffect, useState } from 'react'
import { Button, Modal } from 'react-bootstrap'

/**
 * A modal asking for the user's consent to use tracking cookies. If consent is given it tracks page views using a Facebook pixel.
 */
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
			const { default: ReactPixel } = await import('react-facebook-pixel')
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
				<Modal.Title>This website uses cookies</Modal.Title>
			</Modal.Header>

			<Modal.Body>
				<p>
					We use cookies to personalise ads and analyse our traffic. We also
					share information about your use of our site with our social media,
					advertising and analytics partners who may combine it with other
					information that you’ve provided to them or that they’ve collected
					from your use of their services.
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
