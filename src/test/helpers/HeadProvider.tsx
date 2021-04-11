import { HeadManagerContext } from 'next/dist/next-server/lib/head-manager-context'
import { useEffect } from 'react'
import ReactDOMServer from 'react-dom/server'

/**
 * Allows the testing of markup stored in the `head` element.
 * @returns A wrapper component that renders the `head` element of the HTML page during test.
 */
const HeadProvider: React.FC = ({ children }) => {
	let head: JSX.Element[]

	useEffect(() => {
		global.document.head.insertAdjacentHTML(
			'afterbegin',
			ReactDOMServer.renderToString(<>{head}</>) || ''
		)
	})

	return (
		<HeadManagerContext.Provider
			value={{
				updateHead: (state) => {
					head = state
				},
				mountedInstances: new Set(),
			}}
		>
			{children}
		</HeadManagerContext.Provider>
	)
}

export default HeadProvider
