import React from 'react'
import { Button, Spinner } from 'react-bootstrap'

type Variant =
	| 'primary'
	| 'secondary'
	| 'success'
	| 'danger'
	| 'warning'
	| 'info'
	| 'dark'
	| 'light'
	| 'link'
	| 'outline-primary'
	| 'outline-secondary'
	| 'outline-success'
	| 'outline-danger'
	| 'outline-warning'
	| 'outline-info'
	| 'outline-dark'
	| 'outline-light'

type Type = 'button' | 'submit' | 'reset'

interface ComponentProps {
	id?: string
	className?: string
	status: boolean
	type?: Type
	value?: string
	variant?: Variant
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
	variant = 'primary',
	children,
	activeText,
	disabled,
	onClick,
}: ComponentProps) => (
	<Button
		id={id}
		variant={variant}
		type={type}
		value={value}
		disabled={disabled || status}
		onClick={onClick}
		bsPrefix={className}
	>
		{status ? (
			<>
				<span>{activeText}</span>
				<Spinner as='span' animation='border' role='status' size='sm' />
			</>
		) : (
			<>{children}</>
		)}
	</Button>
)

export default SpinnerButton
