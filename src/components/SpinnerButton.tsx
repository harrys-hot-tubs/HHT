import React from 'react'
import { Spinner } from 'react-bootstrap'

type Type = 'button' | 'submit' | 'reset'

interface ComponentProps {
	id?: string
	className?: string
	/**
	 * Whether the spinner is active.
	 */
	status: boolean
	type?: Type
	value?: string
	children: React.ReactNode
	/**
	 * The text to be displayed when the spinner is active.
	 */
	activeText: string
	disabled?: boolean
	onClick?: React.MouseEventHandler<HTMLElement>
	'data-testid'?: string
}

/**
 * Generic button that allows async actions to be performed, while keeping the user updated, when it is clicked.
 */
const SpinnerButton = ({
	id,
	className = 'button',
	status,
	type = 'button',
	value,
	children,
	activeText,
	disabled,
	onClick,
	'data-testid': dataTestID,
}: ComponentProps) => (
	<button
		id={id}
		type={type}
		value={value}
		disabled={disabled || status}
		onClick={onClick}
		className={className}
		data-testid={dataTestID}
	>
		{status ? (
			<React.Fragment>
				<span>{activeText} </span>
				<Spinner
					animation='border'
					role='status'
					size='sm'
					aria-busy='true'
					aria-label='spinner'
				/>
			</React.Fragment>
		) : (
			<>{children}</>
		)}
	</button>
)

export default SpinnerButton
