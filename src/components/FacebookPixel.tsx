import useConsent from '@hooks/useConsent'
import { Router } from 'next/router'
import { useEffect } from 'react'

/**
 * Facebook Pixel that tracks page views when consent is granted.
 */
const FacebookPixel = () => {
	const [consent] = useConsent()

	useEffect(() => {
		if (consent === true) {
			;(async () => {
				const { default: ReactPixel } = await import('react-facebook-pixel')
				ReactPixel.grantConsent()
				ReactPixel.track('PageView')
			})()
		}
	}, [consent])

	useEffect(() => {
		;(async () => {
			const { default: ReactPixel } = await import('react-facebook-pixel')
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
