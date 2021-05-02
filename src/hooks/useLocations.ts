import { LocationDB } from '@typings/db/Location'
import axios from 'axios'
import useSWR from 'swr'

const fetcher = (url: string) => axios.get(url).then((res) => res.data)

const useLocations = (): {
	locations: LocationDB[]
	isLoading: boolean
	isError: any
} => {
	const { data, error } = useSWR<LocationDB[], any>('/api/locations', fetcher)

	return {
		locations: data,
		isLoading: !error && !data,
		isError: error,
	}
}

export default useLocations
