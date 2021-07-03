import SpinnerButton from '@components/SpinnerButton'
import { DeleteAccountResponse, FormattedAccount } from '@typings/api/Accounts'
import axios from 'axios'
import Cookies from 'js-cookie'
import { useRouter } from 'next/router'
import React, { useState } from 'react'
import { Button, Form, Modal } from 'react-bootstrap'

interface ComponentProps {
	account: FormattedAccount
}

const DeleteAccountButton = ({
	account: { account_id, email_address },
}: ComponentProps) => {
	const [showModal, setShowModal] = useState(false)
	const [spinning, setSpinning] = useState(false)
	const [confirmationText, setConfirmationText] = useState('')
	const [submitButtonEnabled, setSubmitButtonEnabled] = useState(false)
	const router = useRouter()

	const onClick: React.MouseEventHandler<HTMLElement> = async (event) => {
		event.preventDefault()
		setSpinning(true)
		try {
			const { data } = await axios.delete<DeleteAccountResponse>(
				`/api/accounts/${account_id}`
			)

			if (data.error == true) throw new Error(data.message)
			if (data.deleted === false) throw new Error('Failed to delete account.')

			Cookies.remove('token')
			router.push('/')
		} catch (error) {
			setSpinning(false)
		}
	}

	return (
		<>
			<Modal
				show={showModal}
				onHide={() => {
					setShowModal(false)
				}}
				data-testid='delete-account-modal'
			>
				<Modal.Header closeButton>
					<Modal.Title>Account Deletion</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					This action <strong>cannot</strong> be undone. This will permanently
					delete your account.
					<hr />
					<Form>
						<Form.Label className='account-deletion-confirmation'>
							<p>
								Please type <strong>{email_address}</strong> to confirm.
							</p>
						</Form.Label>
						<Form.Control
							value={confirmationText}
							onChange={(event) => {
								setConfirmationText(event.currentTarget.value)
								setSubmitButtonEnabled(
									event.currentTarget.value === email_address
								)
							}}
							data-testid='confirmation-field'
						/>
						<SpinnerButton
							type='submit'
							status={spinning}
							disabled={!submitButtonEnabled}
							activeText='Processing...'
							onClick={onClick}
							variant='danger'
							className='delete-button'
							data-testid='delete-account-confirmation-button'
						>
							I understand the consequences, delete my account.
						</SpinnerButton>
					</Form>
				</Modal.Body>
			</Modal>
			<Button
				variant='danger'
				onClick={() => setShowModal(true)}
				data-testid='delete-account-button'
			>
				Delete Account
			</Button>
		</>
	)
}

export default DeleteAccountButton
