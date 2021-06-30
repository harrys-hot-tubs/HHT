import React from 'react'
import { OverlayTrigger, OverlayTriggerProps } from 'react-bootstrap'

interface ComponentProps extends OverlayTriggerProps {
	disabled: boolean
	'data-testid'?: string
}

const TooltipButton = ({
	children,
	disabled,
	'data-testid': dataTestID,
	...props
}: ComponentProps) => {
	if (!disabled) return <>{children}</>

	return (
		<OverlayTrigger {...props}>
			<div className='tooltip-button-helper' data-testid={dataTestID}>
				{children}
			</div>
		</OverlayTrigger>
	)
}

export default TooltipButton
