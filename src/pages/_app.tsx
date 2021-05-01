import CookieConsentModal from '@components/CookieConsentModal'
import FacebookPixel from '@components/FacebookPixel'
import { enGB } from 'date-fns/locale'
import { AppProps } from 'next/app'
import React from 'react'
import { registerLocale, setDefaultLocale } from 'react-datepicker'
import '../scss/main.scss'

const App = ({ Component, pageProps }: AppProps) => {
	registerLocale('en-GB', enGB)
	setDefaultLocale('en-GB')
	return (
		<React.Fragment>
			<FacebookPixel />
			<CookieConsentModal />
			<Component {...pageProps} />
		</React.Fragment>
	)
}

export default App
