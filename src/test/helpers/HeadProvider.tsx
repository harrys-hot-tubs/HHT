import { HeadManagerContext } from 'next/dist/next-server/lib/head-manager-context'
import { useEffect } from 'react'
import ReactDOMServer from 'react-dom/server'

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
