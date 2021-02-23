import { TubDB } from '@typings/Tub'
import React from 'react'
import { Button, Card } from 'react-bootstrap'

interface ComponentProps extends DisplayableTub {
	onClick: (id: number) => void
}

export interface DisplayableTub extends TubDB {
	price: number
}

const HotTub = ({ tub_id, max_capacity, price, onClick }: ComponentProps) => {
	return (
		<Card className='tub-card'>
			<Card.Img
				variant='top'
				src={getImageHREF(max_capacity)}
				className='thumbnail'
			/>
			<Card.Body>
				<Card.Text className='tub-text'>{max_capacity}-person tub</Card.Text>
				<Card.Text>Price: £{price}</Card.Text>
				<Button
					variant='primary'
					onClick={() => onClick(tub_id)}
					className='tub-hire-button'
				>
					Hire
				</Button>
			</Card.Body>
		</Card>
	)
}

const getImageHREF = (capacity: number) => {
	switch (capacity) {
		case 4:
			return 'tubs/capacity4.jpg'
		case 6:
			return 'tubs/capacity6.jpg'
		case 8:
			return 'tubs/capacity8.jpg'
		default:
			return ''
	}
}

export default HotTub
