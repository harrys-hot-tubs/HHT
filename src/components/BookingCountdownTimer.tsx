import { BookingData } from '@pages/checkout'
import { BookingDB } from '@typings/db/Booking'
import axios from 'axios'
import { differenceInSeconds } from 'date-fns'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { OverlayTrigger, Popover } from 'react-bootstrap'
import { CountdownCircleTimer } from 'react-countdown-circle-timer'

interface ComponentProps {
	bookingData: BookingData
}

const BookingCountdownTimer = ({ bookingData }: ComponentProps) => {
	const router = useRouter()
	const [duration, setDuration] = useState<number>(undefined)

	const clear = async () => {
		localStorage.removeItem('bookingData')
		localStorage.removeItem('tub')
		await deleteBookingReservation(bookingData.bookingID)
		router.push('/hire')
	}

	useEffect(() => {
		if (bookingData) {
			const newDuration = differenceInSeconds(
				bookingData.exp,
				new Date(bookingData.startTime)
			)
			if (newDuration < 0) {
				clear()
			} else {
				setDuration(newDuration)
			}
		}
	}, [bookingData])

	if (!bookingData || duration === undefined)
		return (
			<CountdownCircleTimer
				isPlaying={false}
				duration={10 * 60}
				colors={[
					['#004777', 0.33],
					['#F7B801', 0.33],
					['#A30000', 0.33],
				]}
				size={60}
				strokeWidth={3}
			>
				{({ remainingTime }) => {
					const mins = Math.floor(remainingTime / 60)
					const secs = remainingTime % 60
					return (
						<div className='time-wrapper'>
							<div className='time'>{`${mins}:${String(secs).padStart(
								2,
								'0'
							)}`}</div>
						</div>
					)
				}}
			</CountdownCircleTimer>
		)

	return (
		<OverlayTrigger
			trigger={['hover', 'focus']}
			placement='bottom'
			overlay={
				<Popover id='countdown-popover'>
					<Popover.Content>
						Time until your booking is released.
					</Popover.Content>
				</Popover>
			}
		>
			<div>
				<CountdownCircleTimer
					isPlaying
					initialRemainingTime={
						differenceInSeconds(
							bookingData.exp,
							new Date(bookingData.startTime)
						) - differenceInSeconds(new Date(), new Date(bookingData.startTime))
					}
					duration={duration}
					colors={[
						['#004777', 0.33],
						['#F7B801', 0.33],
						['#A30000', 0.33],
					]}
					onComplete={() => {
						clear()
					}}
					size={60}
					strokeWidth={3}
				>
					{({ remainingTime }) => {
						const mins = Math.floor(remainingTime / 60)
						const secs = remainingTime % 60
						return (
							<div className='time-wrapper'>
								<div className='time'>{`${mins}:${String(secs).padStart(
									2,
									'0'
								)}`}</div>
							</div>
						)
					}}
				</CountdownCircleTimer>
			</div>
		</OverlayTrigger>
	)
}

/**
 * Removes a reserved booking from the database when the reservation has expired.
 *
 * @param bookingID The id of the reserved booking that is to be deleted.
 */
const deleteBookingReservation = async (bookingID: BookingDB['booking_id']) => {
	try {
		const res = await axios.delete(`/api/bookings/${bookingID}`)
		if (res.status !== 200)
			throw new Error('Could not delete reserved booking.')
	} catch (error) {
		console.error(error.message)
		throw error
	}
}

export default BookingCountdownTimer
