import { TubDB } from '@typings/Tub'
import React from 'react'

interface ComponentProps extends DisplayableTub {
	onClick: (id: number) => void
}

export interface DisplayableTub extends TubDB {
	price: number
}

const HotTub = ({ tub_id, max_capacity, price, onClick }: ComponentProps) => {
	return (
		<div onClick={() => onClick(tub_id)} className='card'>
			<img src={getImageHREF(max_capacity)} className='thumbnail' />
			<div className='card-body'>
				<span>{max_capacity}-Person</span>
				<span>£{price}</span>
			</div>
		</div>
	)
}

const getImageHREF = (capacity: number) => {
	switch (capacity) {
		case 4:
			return '/tubs/capacity4.jpeg'
		case 6:
			return '/tubs/capacity6.jpeg'
		case 8:
			return '/tubs/capacity8.jpg'
		default:
			return ''
	}
}

export default HotTub
