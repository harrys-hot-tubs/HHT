import axios from 'axios'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { PriceRequest, PriceResponse } from '../typings/api/Checkout'
import { TubDB } from '../typings/Tub'
import { displayableTubs } from '../utils/tubs'
import HotTub, { DisplayableTub } from './HotTub'

interface ComponentProps {
	tubs: TubDB[]
	startDate: string
	endDate: string
}

const HotTubs = ({ tubs, startDate, endDate }: ComponentProps) => {
	const router = useRouter()
	const [displayable, setDisplayable] = useState<DisplayableTub[]>([])

	useEffect(() => {
		;(async () => {
			const parsedTubs: DisplayableTub[] = await Promise.all(
				displayableTubs(tubs).map(async (tub) => {
					const price = await determinePrice(tub.tub_id, startDate, endDate)
					return {
						...tub,
						price,
					}
				})
			)
			setDisplayable(parsedTubs)
		})()
	}, [tubs, startDate, endDate])

	const onSelectTub = (id: number) => {
		localStorage.setItem('tub', id.toString())
		router.push(`/checkout?tub_id=${id}`)
	}

	if (!tubs?.length) return null
	return (
		<div className='tub-list'>
			{displayable.map((tub) => {
				const props = {
					...tub,
					onClick: onSelectTub,
				}
				return <HotTub {...props} key={tub.tub_id} />
			})}
		</div>
	)
}

const determinePrice = async (
	id: number,
	startDate: string,
	endDate: string
) => {
	const params: PriceRequest = {
		startDate,
		endDate,
	}
	const { data } = await axios.post(`/api/tubs/${id}`, params)
	const { price } = data as PriceResponse
	return price
}

export default HotTubs
