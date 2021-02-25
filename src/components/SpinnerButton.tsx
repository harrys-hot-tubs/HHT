import React from 'react'
import { Spinner } from 'react-bootstrap'

type Type = 'button' | 'submit' | 'reset'

interface ComponentProps {
	id?: string
	className?: string
	status: boolean
	type?: Type
	value?: string
	children: React.ReactNode
	activeText: string
	disabled?: boolean
	onClick?: React.MouseEventHandler<HTMLElement>
}

const SpinnerButton = ({
	id,
	className,
	status,
	type = 'button',
	value,
	children,
	activeText,
	disabled,
	onClick,
}: ComponentProps) => (
	<button
		id={id}
		type={type}
		value={value}
		disabled={disabled || status}
		onClick={onClick}
		className={className}
	>
		{status ? (
			<>
				<span>{activeText} </span>
				<Spinner animation='border' role='status' size='sm' />
			</>
		) : (
			<>{children}</>
		)}
	</button>
)

export default SpinnerButton
