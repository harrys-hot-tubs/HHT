import React from 'react'
import '../scss/main.scss'

const App = ({ Component, pageProps }) => {
	return (
		<div>
			<Component {...pageProps} />
		</div>
	)
}

export default App
