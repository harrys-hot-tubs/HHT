import useTestimonials from '@hooks/useTestimonials'
import React from 'react'
import SwiperCore, { Navigation } from 'swiper'
import 'swiper/components/navigation/navigation.min.css'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/swiper.min.css'

SwiperCore.use([Navigation])

const Testimonials = () => {
	const { testimonials, isLoading, isError } = useTestimonials()

	if (isLoading || isError) return <div />

	return (
		<Swiper navigation loop>
			{testimonials.map((testimonial, idx) => (
				<SwiperSlide key={idx}>
					<span className='testimonial'>
						{truncateTestimonial(testimonial.text)}
					</span>
					<span className='attribution'>
						{testimonial.first_name} {testimonial.last_name}{' '}
						{testimonial.location ? ', ' + testimonial.location : null}
					</span>
				</SwiperSlide>
			))}
		</Swiper>
	)
}

/**
 * Truncates a testimonial to the nearest word below a maximum length.
 *
 * @param {string} testimonial The testimonial to be displayed to the user.
 * @param {number} [maxLength=90] The maximum length of resultant testimonial.
 * @returns The truncated testimonial.
 */
const truncateTestimonial = (testimonial: string, maxLength: number = 90) => {
	const PUNCTUATION = [',', '.', '!', '?']

	// If the string is too long, truncate it to the nearest word
	if (testimonial.length > maxLength) {
		let result = ''
		for (let word of testimonial.split(' ')) {
			if (result.length + word.length > maxLength) {
				// If the final character is a piece of punctuation, remove it
				if (PUNCTUATION.includes(result.charAt(result.length - 2))) {
					result = result.slice(0, result.length - 1)
				}
				result = result.slice(0, result.length - 1) + '...'
				break
			} else {
				result += word + ' '
			}
		}
		return result
	} else {
		return testimonial
	}
}

export default Testimonials
