import CookieConsentModal from '@components/CookieConsentModal'
import FacebookPixel from '@components/FacebookPixel'
import { AppProps } from 'next/app'
import React from 'react'
import 'react-dates/lib/css/_datepicker.css'
import '../scss/main.scss'

const App = ({ Component, pageProps }: AppProps) => {
	return (
		<React.Fragment>
			<FacebookPixel />
			<CookieConsentModal />
			<Component {...pageProps} />
		</React.Fragment>
	)
}

export default App
