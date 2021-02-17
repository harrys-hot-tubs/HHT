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
	id: string
	status: boolean
	type: Type
	value?: string
	variant: Variant
	passiveText: string
	activeText: string
	disabled?: boolean
	onClick?: React.MouseEventHandler<HTMLElement>
}

const SpinnerButton = ({
	id,
	status,
	type,
	value,
	variant,
	passiveText,
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
	>
		{status ? (
			<>
				<Spinner as='span' animation='border' size='sm' role='status' />
				<span>{activeText}</span>
			</>
		) : (
			<>{passiveText}</>
		)}
	</Button>
)

export default SpinnerButton
