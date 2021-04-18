import OrderCard, { OrderState } from '@components/OrderCard'
import { PopulatedOrder } from '@typings/db/Order'
import React, { ReactNode } from 'react'
import { Droppable } from 'react-beautiful-dnd'

export type ListID = 'upcoming' | 'delivered' | 'returned'

interface ComponentProps {
	droppableID: ListID
	children: ReactNode
	orders: PopulatedOrder[]
	className?: string
}

const OrderList = ({
	droppableID,
	children,
	orders,
	className,
}: ComponentProps) => {
	const getState = (): OrderState => {
		switch (droppableID) {
			case 'upcoming':
				return 'dropoff'
			case 'delivered':
				return 'pickup'
			default:
				undefined
		}
	}

	return (
		<div className={className} data-testid={droppableID}>
			{children}
			<Droppable droppableId={droppableID}>
				{(provided) => (
					<div
						ref={provided.innerRef}
						{...provided.droppableProps}
						className='droppable-area'
					>
						{orders.map((order, index) => (
							<OrderCard
								key={order.id}
								index={index}
								state={getState()}
								{...order}
							/>
						))}
						{provided.placeholder}
					</div>
				)}
			</Droppable>
		</div>
	)
}

export default OrderList
