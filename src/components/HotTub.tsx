import { TubDB } from '@typings/Tub'
import React from 'react'
import { Button, Card } from 'react-bootstrap'

interface ComponentProps extends TubDB {
	onClick: (id: number) => void
}

const HotTub = ({ tub_id, max_capacity, onClick }: ComponentProps) => {
	return (
		<Card>
			<Card.Img variant='top' src={getImageHREF(max_capacity)} />
			<Card.Body>
				<Card.Text>Sample text goes here.</Card.Text>
				<Button variant='primary' onClick={() => onClick(tub_id)}>
					Hire
				</Button>
			</Card.Body>
		</Card>
	)
}

export default HotTub

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
