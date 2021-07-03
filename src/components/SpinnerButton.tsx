import React from 'react'
import { Button, ButtonProps, Spinner } from 'react-bootstrap'
import { BsPrefixRefForwardingComponent } from 'react-bootstrap/esm/helpers'

interface ComponentProps extends ButtonProps {
	/**
	 * Whether the spinner is active.
	 */
	status: boolean
	/**
	 * The text to be displayed when the spinner is active.
	 */
	activeText: string
}

/**
 * Generic button that allows async actions to be performed, while keeping the user updated, when it is clicked.
 */
const SpinnerButton: BsPrefixRefForwardingComponent<'button', ComponentProps> =
	({ status, activeText, children, ...props }) => (
		<Button disabled={props.disabled || status} {...props}>
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
		</Button>
	)

export default SpinnerButton
