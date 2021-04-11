import { PopulatedOrder } from '@typings/db/Order'
import axios from 'axios'
import useSWR from 'swr'

const fetcher = (url: string) => axios.get(url).then((res) => res.data)

/**
 * State-while-revalidate hook that fetches all currently existing orders from the database via the API.
 */
const useOrders = (): {
	orders: PopulatedOrder[]
	isLoading: boolean
	isError: any
} => {
	const { data, error } = useSWR<PopulatedOrder[], any>('/api/orders', fetcher)

	return {
		orders: data,
		isLoading: !error && !data,
		isError: error,
	}
}

export default useOrders
