import { ReviewDB } from '@typings/db/Review'
import axios from 'axios'
import useSWR from 'swr'

const fetcher = (url: string) => axios.get(url).then((res) => res.data)

const useTestimonials = (): {
	testimonials: ReviewDB[]
	isLoading: boolean
	isError: any
} => {
	const { data, error } = useSWR<ReviewDB[], any>('/api/reviews', fetcher)

	return {
		testimonials: data,
		isLoading: !error && !data,
		isError: error,
	}
}

export default useTestimonials
