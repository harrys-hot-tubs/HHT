import Footer from '@components/Footer'
import React from 'react'
import '../scss/main.scss'

const App = ({ Component, pageProps }) => {
	return (
		<div>
			<Component {...pageProps} />
			<Footer />
		</div>
	)
}

export default App
