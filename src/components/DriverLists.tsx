import OrderList, { ListID } from '@components/OrderList'
import { OrderDB, PopulatedOrder } from '@typings/db/Order'
import { extractBookingEnd, extractBookingStart } from '@utils/date'
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import {
	DragDropContext,
	DraggableLocation,
	DropResult,
} from 'react-beautiful-dnd'

type ListState = [
	PopulatedOrder[],
	React.Dispatch<React.SetStateAction<PopulatedOrder[]>>
]

export interface ComponentProps {
	orders: PopulatedOrder[]
	maxDate?: Date
	minDate?: Date
}

const DriverLists = ({ orders, maxDate, minDate }: ComponentProps) => {
	useEffect(() => {
		setUpcoming(
			sortByDate(upcomingDeliveries(orders, maxDate, minDate), 'start')
		)
		setDelivered(sortByDate(upcomingPickups(orders, maxDate, minDate), 'end'))
		setReturned(sortByDate(completed(orders), 'start'))
	}, [maxDate, minDate])

	const [upcoming, setUpcoming] = useState<PopulatedOrder[]>(
		sortByDate(upcomingDeliveries(orders, maxDate, minDate), 'start')
	)
	const [delivered, setDelivered] = useState<PopulatedOrder[]>(
		sortByDate(upcomingPickups(orders, maxDate, minDate), 'end')
	)
	const [returned, setReturned] = useState<PopulatedOrder[]>(
		sortByDate(completed(orders), 'start')
	)

	const getListByID = (id: ListID): ListState => {
		switch (id) {
			case 'upcoming':
				return [upcoming, setUpcoming]
			case 'delivered':
				return [delivered, setDelivered]
			case 'returned':
				return [returned, setReturned]
			default:
				throw new Error(`No list with id ${id}`)
		}
	}

	const updatePosition = (
		source: DraggableLocation,
		destination: DraggableLocation
	) => {
		if (!destination) return //Dropped outside of lists

		if (source.droppableId === destination.droppableId) {
			if (source.index === destination.index) return
			reorder(
				getListByID(destination.droppableId as ListID),
				source.index,
				destination.index
			)
		} else {
			moveOrder(
				getListByID(source.droppableId as ListID),
				getListByID(destination.droppableId as ListID),
				source,
				destination
			)
		}
	}

	const updateDatabase = async (
		source: DraggableLocation,
		destination: DraggableLocation
	) => {
		if (!destination) return
		if (source.droppableId === destination.droppableId) return
		const [orders] = getListByID(destination.droppableId as ListID)
		const { id } = orders[destination.index]
		let body: Partial<OrderDB> = {}
		switch (destination.droppableId as ListID) {
			case 'upcoming':
				body = { fulfilled: false, returned: false }
				break
			case 'delivered':
				body = { fulfilled: true, returned: false }
				break
			case 'returned':
				body = { fulfilled: true, returned: true }
				break
			default:
				throw new Error(`No list with id ${destination.droppableId}`)
		}
		const { data } = await axios.post<OrderDB>(`/api/orders/${id}`, body)
		return data
	}

	const onDragEnd = async (result: DropResult): Promise<void> => {
		const { source, destination } = result
		updatePosition(source, destination)
		await updateDatabase(source, destination)
	}

	//TODO add horizontal list for emergency unfulfilled orders

	return (
		<DragDropContext onDragEnd={onDragEnd}>
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
	)
}

const upcomingDeliveries = (
	orders: PopulatedOrder[],
	maxDate: Date,
	minDate: Date
): PopulatedOrder[] => {
	return orders.filter(({ booking_duration, fulfilled, returned }) => {
		const deliveryDate = extractBookingStart(booking_duration)
		return (
			deliveryDate >= minDate &&
			deliveryDate <= maxDate &&
			!returned &&
			!fulfilled
		)
	})
}

const upcomingPickups = (
	orders: PopulatedOrder[],
	maxDate: Date,
	minDate: Date
): PopulatedOrder[] => {
	return orders.filter(({ booking_duration, fulfilled, returned }) => {
		const pickupDate = extractBookingEnd(booking_duration)
		return (
			pickupDate >= minDate && pickupDate <= maxDate && !returned && fulfilled
		)
	})
}

const completed = (orders: PopulatedOrder[]): PopulatedOrder[] =>
	orders.filter(({ returned, fulfilled }) => fulfilled && returned)

const sortByDate = (
	orders: PopulatedOrder[],
	date: 'start' | 'end'
): PopulatedOrder[] =>
	orders.sort((a, b) => {
		if (date === 'start')
			return (
				extractBookingStart(a.booking_duration).getTime() -
				extractBookingEnd(b.booking_duration).getTime()
			)
		if (date === 'end')
			return (
				extractBookingEnd(a.booking_duration).getTime() -
				extractBookingEnd(b.booking_duration).getTime()
			)
	})

const moveOrder = (
	source: ListState,
	destination: ListState,
	sourceDroppable: DraggableLocation,
	destinationDroppable: DraggableLocation
): void => {
	const [sourceValues, updateSource] = source
	const [destinationValues, updateDestination] = destination

	const [removed] = sourceValues.splice(sourceDroppable.index, 1)
	updateSource(sourceValues)

	destinationValues.splice(destinationDroppable.index, 0, removed)
	updateDestination(destinationValues)
}

const reorder = (
	list: ListState,
	source: number,
	destination: number
): void => {
	const [values, update] = list
	const [removed] = values.splice(source, 1)
	values.splice(destination, 0, removed)
	update(values)
}

export default DriverLists
