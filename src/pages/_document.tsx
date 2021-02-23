import Document, { Head, Html, Main, NextScript } from 'next/document'
import React from 'react'

class HHTDoc extends Document {
	render() {
		return (
			<Html>
				<title>Create Next App</title>
				<Head>
					<link rel='icon' href='/favicon.ico' />
				</Head>
				<body>
					<Main />
					<NextScript />
				</body>
			</Html>
		)
	}
}

export default HHTDoc
