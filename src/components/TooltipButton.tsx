import React from 'react'
import { OverlayTrigger, OverlayTriggerProps } from 'react-bootstrap'

interface ComponentProps extends OverlayTriggerProps {
	disabled: boolean
}

const TooltipButton = ({ children, disabled, ...props }: ComponentProps) => {
	if (!disabled) return <>{children}</>

	return (
		<OverlayTrigger {...props}>
			<div
				className='tooltip-button-helper'
				data-testid='tooltip-button-container'
			>
				{children}
			</div>
		</OverlayTrigger>
	)
}

export default TooltipButton
