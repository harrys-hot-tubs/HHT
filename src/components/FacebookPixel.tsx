import useConsent from '@hooks/useConsent'
import { Router } from 'next/router'
import { useEffect } from 'react'

const FacebookPixel = () => {
	const [consent] = useConsent()

	useEffect(() => {
		if (consent === true) {
			;(async () => {
				const ReactPixel = (await import('react-facebook-pixel')).default
				ReactPixel.grantConsent()
				ReactPixel.track('PageView')
			})()
		}
	}, [consent])

	useEffect(() => {
		;(async () => {
			const ReactPixel = (await import('react-facebook-pixel')).default
			ReactPixel.revokeConsent()
			ReactPixel.init(process.env.NEXT_PUBLIC_PIXEL_ID)
			ReactPixel.pageView()

			Router.events.on('routeChangeComplete', () => {
				ReactPixel.pageView()
			})
		})()
	}, [])
	return null
}

export default FacebookPixel
