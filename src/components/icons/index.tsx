import Link from 'next/link'
import React from 'react'

interface ComponentProps {
	icon: React.ReactElement
	href?: string
	className?: string
}

const Icon = ({ icon, href, className }: ComponentProps) => {
	const cloned = React.cloneElement(icon, {
		className,
	})
	return (
		<Link href={href}>
			<a target='_blank'>{cloned}</a>
		</Link>
	)
}

export default Icon
