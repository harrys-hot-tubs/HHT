import RefundModal from '@components/modals/RefundModal'
import OrderList, { ListID } from '@components/OrderList'
import useDriverLists from '@hooks/useDriverLists'
import useRefundModal from '@hooks/useRefundModal'
import useStateWithPromise from '@hooks/useStateWithPromise'
import { PopulatedOrder } from '@typings/db/Order'
import React, { useRef } from 'react'
import { DragDropContext, DropResult, SensorAPI } from 'react-beautiful-dnd'

export interface ComponentProps {
	orders: PopulatedOrder[]
	maxDate?: Date
	minDate?: Date
}

const DriverLists = ({ orders, maxDate, minDate }: ComponentProps) => {
	const {
		upcoming: [upcoming],
		delivered: [delivered],
		returned: [returned],
		getListByID,
		updatePosition,
	} = useDriverLists({ orders, maxDate, minDate })
	const {
		state: { show, lastMoved, lastSource, lastDestination, modalVersion },
		setShow: setShowRefundModal,
		logMove,
	} = useRefundModal()
	const [programmedMove, setProgrammedMove] =
		useStateWithPromise<boolean>(false)

	const sensorAPIRef = useRef<SensorAPI>(null)

	const onDragEnd = (result: DropResult): void => {
		const { source, destination } = result
		const moved = getListByID(source.droppableId as ListID)[0][source.index]
		if (destination && source) {
			logMove(moved, { source, destination })

			if (!programmedMove) {
				setShowRefundModal(
					(destination.droppableId === 'returned' &&
						source.droppableId !== 'returned') ||
						(source.droppableId === 'returned' &&
							destination.droppableId !== 'returned')
				)
			}
			updatePosition(result)
		}
		setProgrammedMove(false)
	}

	return (
		<>
			<RefundModal
				show={show}
				setShow={setShowRefundModal}
				order={lastMoved}
				apiRef={sensorAPIRef}
				modalVersion={modalVersion}
				setProgrammedMove={setProgrammedMove}
				lastSource={lastSource}
				lastDestination={lastDestination}
			/>
			<DragDropContext
				onDragEnd={onDragEnd}
				sensors={[(api) => (sensorAPIRef.current = api)]}
			>
				<div className='orders'>
					<OrderList
						droppableID='upcoming'
						orders={upcoming}
						className='order-list'
					>
						<h2>Upcoming</h2>
					</OrderList>
					<OrderList
						droppableID='delivered'
						orders={delivered}
						className='order-list'
					>
						<h2>Delivered</h2>
					</OrderList>
					<OrderList
						droppableID='returned'
						orders={returned}
						className='order-list'
					>
						<h2>Returned</h2>
					</OrderList>
				</div>
			</DragDropContext>
		</>
	)
}

export default DriverLists
