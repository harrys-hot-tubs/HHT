import HotTub, { DisplayableTub } from '@components/HotTub'
import NoAvailabilities from '@components/NoAvailabilities'
import { PriceRequest, PriceResponse } from '@typings/api/Checkout'
import { TubDB } from '@typings/db/Tub'
import { displayableTubs } from '@utils/tubs'
import axios from 'axios'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'

interface ComponentProps {
	/**
	 * All tubs to be displayed to the customer.
	 */
	tubs: TubDB[]
	/**
	 * The start date of the customer's booking.
	 */
	startDate: string
	/**
	 * The end date of the customer's booking.
	 */
	endDate: string
}

/**
 * Displays icons for all possible hot tubs the customer could choose to book.
 */
const HotTubs = ({ tubs, startDate, endDate }: ComponentProps) => {
	const router = useRouter()
	const [displayable, setDisplayable] = useState<DisplayableTub[]>([])

	useEffect(() => {
		if (tubs) {
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
		}
	}, [tubs, startDate, endDate])

	const onSelectTub = (id: number) => {
		localStorage.setItem('tub', id.toString())
		router.push(`/checkout?tub_id=${id}`)
	}

	if (tubs === null) return null
	if (tubs.length === 0) return <NoAvailabilities />
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

/**
 * Queries the API to determine the price of a given hot tub over a given booking.
 * @param id The id of the hot tub to be priced.
 * @param startDate The start date of the customer's booking.
 * @param endDate The end date of the customer's booking.
 * @returns The price to the customer for booking the particular tub from the start date to the end date.
 */
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
