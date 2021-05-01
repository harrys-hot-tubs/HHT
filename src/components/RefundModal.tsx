import { ListID } from '@components/OrderList'
import { RefundModalVersion } from '@hooks/useRefundModal'
import { PopulatedOrder } from '@typings/db/Order'
import { RefundDB } from '@typings/db/Refund'
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { DraggableLocation, SensorAPI } from 'react-beautiful-dnd'
import { Button, Form, Modal } from 'react-bootstrap'
import SpinnerButton from './SpinnerButton'

interface ComponentProps {
	show: boolean
	setShow: React.Dispatch<React.SetStateAction<boolean>>
	order: PopulatedOrder
	lastSource: DraggableLocation
	lastDestination: DraggableLocation
	apiRef: React.MutableRefObject<SensorAPI>
	modalVersion: RefundModalVersion
	setProgrammedMove: (value: boolean) => Promise<void>
}

const RefundModal = ({
	show,
	setShow,
	order,
	apiRef,
	modalVersion: modalState,
	setProgrammedMove,
	lastDestination,
	lastSource,
}: ComponentProps) => {
	useEffect(() => {
		const handler = async () => {
			if (show) {
				await setProgrammedMove(true)
				setShow(false)
				resetLastMove()
			}
		}

		window.addEventListener('beforeunload', handler)
		return () => {
			window.removeEventListener('beforeunload', handler)
		}
	})

	const [damaged, setDamaged] = useState<boolean>(false)
	const [damageDetails, setDamageDetails] = useState(undefined)
	const [loading, setLoading] = useState(false)

	const addRefund: React.FormEventHandler<HTMLFormElement> = async (event) => {
		event.preventDefault()
		const body: Omit<RefundDB, 'account_id' | 'order_id'> = {
			damaged,
			damage_information: damageDetails,
		}
		setLoading(true)
		try {
			await axios.post(`/api/refunds/${order.id}`, body)
		} catch (e) {
			console.warn(e)
		} finally {
			setLoading(false)
			setShow(false)
		}
	}

	const removeRefund: React.MouseEventHandler<HTMLElement> = async (event) => {
		event.preventDefault()
		setLoading(true)
		try {
			await axios.delete(`/api/refunds/${order.id}`)
		} catch (e) {
			console.warn(e)
		} finally {
			setLoading(false)
			setShow(false)
		}
	}

	const undo: React.MouseEventHandler<HTMLElement> = async (event) => {
		event.preventDefault()
		await setProgrammedMove(true)
		setShow(false)
		resetLastMove()
	}

	const resetLastMove = () => {
		const api = apiRef.current
		if (!api) {
			return console.warn('Could not find Sensor API')
		}

		const preDrag = api.tryGetLock(order?.id)
		if (!preDrag) {
			return console.warn('Could not find draggable')
		}

		const { moveLeft, moveRight, drop } = preDrag.snapLift()
		if ((lastDestination.droppableId as ListID) === 'returned') {
			switch (lastSource.droppableId as ListID) {
				case 'delivered':
					moveLeft()
					break
				case 'upcoming':
					moveLeft()
					moveLeft()
					break
			}
		} else {
			switch (lastDestination.droppableId as ListID) {
				case 'delivered':
					moveRight()
					break
				case 'upcoming':
					moveRight()
					moveRight()
					break
			}
		}
		drop()
	}

	return (
		<Modal show={show} data-testid='refund-modal'>
			<Modal.Header>
				<Modal.Title>Refund Information</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				{modalState === 'ADD_REFUND' ? (
					<Form onSubmit={addRefund}>
						<Form.Group>
							<Form.Label>Damage Status</Form.Label>
							<Form.Check
								onChange={() => setDamaged(!damaged)}
								checked={damaged}
								label={`Did ${order?.first_name} ${order?.last_name} damage the hot tub?`}
							/>
						</Form.Group>
						<Form.Group>
							<Form.Label>Damage Details</Form.Label>
							<Form.Control
								required={damaged}
								disabled={!damaged}
								value={damageDetails}
								onChange={(e) => setDamageDetails(e.currentTarget.value)}
								as='textarea'
							/>
						</Form.Group>
						<SpinnerButton
							data-testid='process-refund-button'
							type='submit'
							activeText='Submitting...'
							status={loading}
						>
							Submit
						</SpinnerButton>
						<Button variant='secondary' onClick={undo}>
							Go Back
						</Button>
					</Form>
				) : (
					<div>
						<p>
							If you choose to continue, the record of a refund assessment for{' '}
							{order?.first_name + ' ' + order?.last_name} will be removed. Are
							you sure you still want to continue?
						</p>
						<SpinnerButton
							onClick={removeRefund}
							activeText='Removing...'
							status={loading}
						>
							Yes
						</SpinnerButton>
						<Button variant='secondary' onClick={undo}>
							No
						</Button>
					</div>
				)}
			</Modal.Body>
		</Modal>
	)
}

export default RefundModal
