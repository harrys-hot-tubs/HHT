import Link from 'next/link'
import React from 'react'

interface ComponentProps {
	icon: React.ReactElement
	href?: string
	className?: string
	'aria-label'?: string
}

const Icon = ({
	icon,
	href,
	className,
	'aria-label': label,
}: ComponentProps) => {
	const cloned = React.cloneElement(icon, {
		className,
	})
	return (
		<Link href={href} aria-role='img'>
			<a target='_blank' role='link' aria-label={label}>
				{cloned}
			</a>
		</Link>
	)
}

export default Icon
