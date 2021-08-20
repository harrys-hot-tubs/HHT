import React from 'react'

interface ComponentProps {
	/**
	 * SVG icon to constitute the visual part of the icon.
	 */
	icon: React.ReactElement
	href?: string
	className?: string
	'aria-label'?: string
}

/**
 * Generic SVG icon component.
 * @returns An icon with an optional link to a specific `href`.
 */
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
		<a target='_blank' role='link' aria-label={label} href={href}>
			{cloned}
		</a>
	)
}

export default Icon
