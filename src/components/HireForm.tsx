import Calendar from '@components/Calendar'
import HotTubs from '@components/HotTubs'
import PostcodeField from '@components/PostcodeField'
import SpinnerButton from '@components/SpinnerButton'
import useCalendar from '@hooks/useCalendar'
import usePostcode from '@hooks/usePostcode'
import {
	AvailabilityRequest,
	AvailabilityResponse,
} from '@typings/api/Availability'
import { TubDB } from '@typings/db/Tub'
import { getClosestDispatcher } from '@utils/postcode'
import axios, { AxiosResponse } from 'axios'
import React, { useEffect, useState } from 'react'
import { Form } from 'react-bootstrap'

const HireForm = () => {
	const calendar = useCalendar()
	const postcode = usePostcode()
	const [loading, setLoading] = useState(false)
	const [tubs, setTubs] = useState<TubDB[]>(null)

	const onSubmit: React.FormEventHandler<HTMLFormElement> = async (
		event: React.FormEvent
	) => {
		setLoading(true)
		event.preventDefault()
		event.stopPropagation()

		const { data } = await axios.post<
			AvailabilityRequest,
			AxiosResponse<AvailabilityResponse>
		>('/api/availability', {
			closest: await getClosestDispatcher(postcode.value.trim()),
			startDate: calendar.startDate.toISOString(),
			endDate: calendar.endDate.toISOString(),
		})
		if (data.available) setTubs(data.tubs)
		else setTubs([])
		setLoading(false)
	}

	useEffect(() => {
		setTubs(null)
	}, [calendar.startDate, calendar.endDate, postcode.value])

	return (
		<>
			<Form onSubmit={onSubmit} className='hire-form' inline>
				<span className='hire-information'>
					From
					<Calendar {...calendar} />
					delivered to
					<PostcodeField
						loading={postcode.loading}
						postcode={postcode.value}
						isInvalid={postcode.valid == false}
						isValid={postcode.valid}
						onChange={postcode.setValue}
						invalidReason={postcode.message}
						onValidate={postcode.validate}
					/>
				</span>
				<br />
				<SpinnerButton
					type='submit'
					status={loading}
					disabled={!postcode.valid || !calendar.isValid()}
					className='hire-submit'
				>
					Go
				</SpinnerButton>
			</Form>
			<HotTubs
				tubs={tubs}
				startDate={calendar.startDate?.toISOString()}
				endDate={calendar.endDate?.toISOString()}
			/>
		</>
	)
}

export default HireForm
