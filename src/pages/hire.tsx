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
import { TubDB } from '@typings/Tub'
import { getClosestDispatcher } from '@utils/postcode'
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { Form } from 'react-bootstrap'

const Hire = () => {
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

		const params: AvailabilityRequest = {
			closest: await getClosestDispatcher(postcode.value),
			startDate: calendar.startDate.toISOString(),
			endDate: calendar.endDate.toISOString(),
		}
		const { data } = await axios.post<AvailabilityResponse>(
			'/api/availability',
			params
		)
		if (data.available) setTubs(data.tubs)
		else setTubs([])
		setLoading(false)
	}

	useEffect(() => {
		setTubs(null)
	}, [calendar.startDate, calendar.endDate, postcode.value])

	return (
		<div className='hire-container'>
			<img src='hire.jpg' className='hire-background' />
			<div className='primary-container'>
				<Form onSubmit={onSubmit} className='hire-form'>
					<h1>Hire a hot tub</h1>
					<Calendar {...calendar} />
					<PostcodeField
						loading={postcode.loading}
						postcode={postcode.value}
						isInvalid={postcode.valid == false}
						isValid={postcode.valid}
						onChange={postcode.setValue}
						invalidReason={postcode.message}
						onValidate={postcode.validate}
					/>
					<SpinnerButton
						type='submit'
						status={loading}
						disabled={!postcode.valid || !calendar.isValid()}
						className='hire-submit'
						activeText='Loading... '
					>
						Submit
					</SpinnerButton>
				</Form>
			</div>
			<HotTubs
				tubs={tubs}
				startDate={calendar.startDate?.toISOString()}
				endDate={calendar.endDate?.toISOString()}
			/>
		</div>
	)
}
export default Hire
