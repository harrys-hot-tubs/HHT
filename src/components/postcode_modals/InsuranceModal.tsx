import { PostcodeModalProps } from '@components/postcode_modals/PostcodeModal'
import React from 'react'
import { Modal } from 'react-bootstrap'
import InstagramIcon from '../icons/InstagramIcon'

const InsuranceModal = ({ display, hide }: PostcodeModalProps) => (
	<Modal show={display} onHide={hide} centered>
		<Modal.Header closeButton>
			<Modal.Title>Thanks for your interest!</Modal.Title>
		</Modal.Header>
		<Modal.Body role='alert'>
			For bookings in the LS6 postcode, please inquire via Instagram.
		</Modal.Body>
		<Modal.Footer>
			<InstagramIcon />
		</Modal.Footer>
	</Modal>
)

export default InsuranceModal
