import React, { useRef, useState } from 'react'
import { Button, Form, Modal } from 'react-bootstrap'

interface ComponentProps {
	show: boolean
	setShow: React.Dispatch<React.SetStateAction<boolean>>
}

const RefundModal = ({ show, setShow }: ComponentProps) => {
	const ref = useRef()
	const [damaged, setDamaged] = useState<boolean>(false)

	return (
		<Modal show={show} onHide={() => setShow(false)}>
			<Modal.Header>
				<Modal.Title>Refund Information</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<Form>
					<Form.Check
						onClick={() => setDamaged(!damaged)}
						checked={damaged}
						label={`Did ${`[NAME]`} damage the hot tub?`}
					/>
					<Button>Submit</Button>
					<Button variant='secondary'>Exit</Button>
				</Form>
			</Modal.Body>
		</Modal>
	)
}

export default RefundModal
