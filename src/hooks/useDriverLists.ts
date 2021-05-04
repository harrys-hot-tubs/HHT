import { ListID } from '@components/OrderList'
import { OrderDB, PopulatedOrder } from '@typings/db/Order'
import {
	completed,
	sortByDate,
	upcomingDeliveries,
	upcomingPickups,
} from '@utils/orders'
import axios from 'axios'
import { useEffect, useState } from 'react'
import { DraggableLocation, DropResult } from 'react-beautiful-dnd'

type ListState = [
	PopulatedOrder[],
	React.Dispatch<React.SetStateAction<PopulatedOrder[]>>
]

interface UseDriverListsArgs {
	orders: PopulatedOrder[]
	maxDate?: Date
	minDate?: Date
}

const useDriverLists = ({
	orders,
	maxDate,
	minDate,
}: UseDriverListsArgs): {
	upcoming: ListState
	delivered: ListState
	returned: ListState
	getListByID: (id: ListID) => ListState
	updatePosition: (result: DropResult) => void
} => {
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
	const [lastDrag, setLastDrag] = useState<DropResult>(undefined)

	useEffect(() => {
		if (lastDrag) {
			;(async () => {
				await updateDatabase(lastDrag)
			})()
		}
	}, [lastDrag])

	const updatePosition = (result: DropResult) => {
		const { source, destination } = result
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
		setLastDrag(result)
	}

	const updateDatabase = async (result: DropResult) => {
		const { source, destination } = result

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

	return {
		upcoming: [upcoming, setUpcoming],
		delivered: [delivered, setDelivered],
		returned: [returned, setReturned],
		getListByID,
		updatePosition,
	}
}

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

export default useDriverLists
