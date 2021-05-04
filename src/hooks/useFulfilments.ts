import { FulfilmentDB } from '@typings/db/Fulfilment'
import axios from 'axios'
import useSWR from 'swr'

const fetcher = (url: string) => axios.get(url).then((res) => res.data)

const useFulfilments = (): {
	fulfilments: FulfilmentDB[]
	isLoading: boolean
	isError: any
} => {
	const { data, error } = useSWR<FulfilmentDB[], any>(
		'/api/fulfilments',
		fetcher
	)

	return {
		fulfilments: data,
		isLoading: !error && !data,
		isError: error,
	}
}

export default useFulfilments
