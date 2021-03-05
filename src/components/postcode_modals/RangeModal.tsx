import FacebookIcon from '@components/icons/FacebookIcon'
import InstagramIcon from '@components/icons/InstagramIcon'
import React from 'react'
import { Modal } from 'react-bootstrap'
import { PostcodeModalProps } from './PostcodeModal'

const RangeModal = ({ display, hide }: PostcodeModalProps) => (
	<Modal show={display} onHide={hide} centered>
		<Modal.Header closeButton>
			<Modal.Title>Oh no!</Modal.Title>
		</Modal.Header>
		<Modal.Body>
			Sadly we don't currently offer deliveries in your area. While we expand
			our delivery capacity, check out our social media below.
		</Modal.Body>
		<Modal.Footer>
			<FacebookIcon />
			<InstagramIcon />
		</Modal.Footer>
	</Modal>
)

export default RangeModal
