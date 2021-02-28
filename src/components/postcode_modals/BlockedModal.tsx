import React from 'react'
import { Modal } from 'react-bootstrap'
import { PostcodeModalProps } from './PostcodeModal'

const BlockedModal = ({ display, hide }: PostcodeModalProps) => (
	<Modal show={display} onHide={hide} centered>
		<Modal.Header closeButton>
			<Modal.Title>Oh no!</Modal.Title>
		</Modal.Header>
		<Modal.Body>Delivery in your area is subject to change.</Modal.Body>
		<Modal.Footer>
			Get in touch with us at{' '}
			<a href='mailto:harry@harryshottubs.com'>harry@harryshottubs.com</a>
		</Modal.Footer>
	</Modal>
)

export default BlockedModal
