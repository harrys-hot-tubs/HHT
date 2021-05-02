import { ListID } from '@components/OrderList'
import { PopulatedOrder } from '@typings/db/Order'
import { useState } from 'react'
import { DraggableLocation } from 'react-beautiful-dnd'

export type RefundModalVersion = 'ADD_REFUND' | 'REMOVE_REFUND'

interface RefundModalState {
	show: boolean
	modalVersion: RefundModalVersion
	lastMoved: PopulatedOrder
	lastDestination: DraggableLocation
	lastSource: DraggableLocation
}

const useRefundModal = () => {
	const [state, setState] = useState<RefundModalState>({
		show: false,
		modalVersion: undefined,
		lastMoved: undefined,
		lastDestination: undefined,
		lastSource: undefined,
	})

	const setShow = (value: boolean) =>
		setState((state) => ({ ...state, show: value }))

	const logMove = (
		lastMoved: PopulatedOrder,
		{
			source,
			destination,
		}: {
			source: DraggableLocation
			destination: DraggableLocation
		}
	) => {
		setState((state) => ({
			...state,
			lastMoved,
			lastDestination: destination,
			lastSource: source,
			modalVersion:
				(destination?.droppableId as ListID) === 'returned'
					? 'ADD_REFUND'
					: 'REMOVE_REFUND',
		}))
	}

	return {
		state,
		setShow,
		logMove,
	}
}

export default useRefundModal
