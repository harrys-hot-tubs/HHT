declare module '*.svg' {
	import React from 'react'
	export const src: string
	const content: React.FunctionComponent<React.SVGProps<SVGSVGElement>>
	export default content
}
