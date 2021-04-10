import { LocationDB } from '@typings/db/Location'
import axios from 'axios'
import useSWR from 'swr'

const fetcher = (url: string) => axios.get(url).then((res) => res.data)

const useLocation = (): {
	location: Pick<LocationDB, 'name' | 'location_id'>
	isLoading: boolean
	isError: any
} => {
	const { data, error } = useSWR<Pick<LocationDB, 'name' | 'location_id'>, any>(
		'/api/accounts',
		fetcher
	)

	return {
		location: data,
		isLoading: !error && !data,
		isError: error,
	}
}

export default useLocation
