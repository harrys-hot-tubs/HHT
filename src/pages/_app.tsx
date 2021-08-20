import FacebookPixel from '@components/FacebookPixel'
import CookieConsentModal from '@components/modals/CookieConsentModal'
import { enGB } from 'date-fns/locale'
import { AppProps } from 'next/app'
import React from 'react'
import { registerLocale, setDefaultLocale } from 'react-datepicker'
import Footer from '@components/Footer'
import Header from '@components/Header'
import '../scss/main.scss'

const App = ({ Component, pageProps }: AppProps) => {
	registerLocale('en-GB', enGB)
	setDefaultLocale('en-GB')
	return (
		<>
			<FacebookPixel />
			<CookieConsentModal />
			<Header />
			<Component {...pageProps} />
			<Footer />
		</>
	)
}

export default App
