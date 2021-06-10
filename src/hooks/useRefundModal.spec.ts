import { bookings } from '@fixtures/bookingFixtures'
import { storedOrder } from '@fixtures/orderFixtures'
import { mixedSizes } from '@fixtures/tubFixtures'
import useRefundModal, { RefundModalState } from '@hooks/useRefundModal'
import { act, renderHook } from '@testing-library/react-hooks'
import { PopulatedOrder } from '@typings/db/Order'
import { DraggableLocation } from 'react-beautiful-dnd'

const movedOrder: PopulatedOrder = {
	...storedOrder,
	...bookings[0],
	...mixedSizes[0],
}

it('updates internal state when logging a move', () => {
	const { result } = renderHook(() => useRefundModal())
	const moveInfo: {
		source: DraggableLocation
		destination: DraggableLocation
	} = {
		source: { droppableId: 'source', index: 0 },
		destination: { droppableId: 'destination', index: 0 },
	}

	act(() => {
		result.current.logMove(movedOrder, moveInfo)
	})

	expect(result.current.state).toMatchObject<RefundModalState>({
		show: false,
		lastMoved: movedOrder,
		lastDestination: moveInfo.destination,
		lastSource: moveInfo.source,
		modalVersion: 'REMOVE_REFUND',
	})
})

it('changes the modal type to ADD_REFUND when moving to the returned column', () => {
	const { result } = renderHook(() => useRefundModal())
	const moveInfo: {
		source: DraggableLocation
		destination: DraggableLocation
	} = {
		source: { droppableId: 'source', index: 0 },
		destination: { droppableId: 'returned', index: 0 },
	}

	act(() => {
		result.current.logMove(movedOrder, moveInfo)
	})

	expect(result.current.state).toMatchObject<RefundModalState>({
		show: false,
		lastMoved: movedOrder,
		lastDestination: moveInfo.destination,
		lastSource: moveInfo.source,
		modalVersion: 'ADD_REFUND',
	})
})

it('updates the value of show when setShow is called', () => {
	const { result } = renderHook(() => useRefundModal())

	act(() => {
		result.current.setShow(true)
	})

	expect(result.current.state).toMatchObject(
		expect.objectContaining<Pick<RefundModalState, 'show'>>({
			show: true,
		})
	)

	act(() => {
		result.current.setShow(!result.current.state.show)
	})

	expect(result.current.state).toMatchObject(
		expect.objectContaining<Pick<RefundModalState, 'show'>>({
			show: false,
		})
	)
})
