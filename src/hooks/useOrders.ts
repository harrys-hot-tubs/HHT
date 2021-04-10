import { PopulatedOrder } from '@typings/db/Order'
import axios from 'axios'
import useSWR from 'swr'

const fetcher = (url: string) => axios.get(url).then((res) => res.data)

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
