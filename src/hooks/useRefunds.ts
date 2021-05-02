import { RefundDB } from '@typings/db/Refund'
import axios from 'axios'
import useSWR from 'swr'

const fetcher = (url: string) => axios.get(url).then((res) => res.data)

const useRefunds = (): {
	refunds: RefundDB[]
	isLoading: boolean
	isError: any
} => {
	const { data, error } = useSWR<RefundDB[], any>('/api/refunds', fetcher)

	return {
		refunds: data,
		isLoading: !error && !data,
		isError: error,
	}
}

export default useRefunds
