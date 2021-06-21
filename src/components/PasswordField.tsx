import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useRef, useState } from 'react'
import { FormControl, FormControlProps, InputGroup } from 'react-bootstrap'
import { BsPrefixRefForwardingComponent } from 'react-bootstrap/esm/helpers'

const PasswordField: BsPrefixRefForwardingComponent<
	'input',
	Omit<FormControlProps, 'type'>
> = (props) => {
	const [fieldType, setFieldType] = useState<'text' | 'password'>('password')
	const input = useRef<HTMLInputElement>(null)

	const onClick: React.MouseEventHandler<SVGSVGElement> = () => {
		setFieldType(fieldType === 'password' ? 'text' : 'password')
		input.current.focus()
	}

	return (
		<InputGroup>
			<FormControl type={fieldType} {...props} ref={input} />
			<InputGroup.Append>
				<InputGroup.Text>
					<span className='eye-icon-container'>
						<FontAwesomeIcon
							icon={fieldType === 'password' ? faEye : faEyeSlash}
							onClick={onClick}
							onMouseDown={(e) => e.preventDefault()}
							className='eye-icon'
						/>
					</span>
				</InputGroup.Text>
			</InputGroup.Append>
		</InputGroup>
	)
}

export default PasswordField
