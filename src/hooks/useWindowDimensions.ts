import { useEffect, useState } from 'react'

const getWindowDimensions = () => {
	try {
		const { innerWidth: width, innerHeight: height } = window
		return {
			width,
			height,
		}
	} catch (error) {
		return {
			width: 0,
			height: 0,
		}
	}
}
/**
 * Provides the dimensions of the viewport the application is being viewed in, updating after any changes. As per https://stackoverflow.com/questions/36862334/get-viewport-window-height-in-reactjs
 * @returns The dimensions of the containing viewport.
 */
const useWindowDimensions = () => {
	const [windowDimensions, setWindowDimensions] = useState(
		getWindowDimensions()
	)

	useEffect(() => {
		const handleResize = () => {
			setWindowDimensions(getWindowDimensions())
		}

		window.addEventListener('resize', handleResize)
		return () => window.removeEventListener('resize', handleResize)
	}, [])

	return windowDimensions
}

export default useWindowDimensions
