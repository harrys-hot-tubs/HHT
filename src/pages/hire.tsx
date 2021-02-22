import Calendar from '@components/Calendar'
import HotTub from '@components/HotTub'
import PostcodeField from '@components/PostcodeField'
import useCalendar from '@hooks/useCalendar'
import usePostcode from '@hooks/usePostcode'
import {
	AvailabilityRequest,
	AvailabilityResponse,
} from '@typings/api/Availability'
import { TubDB } from '@typings/Tub'
import { getClosestDispatcher } from '@utils/postcode'
import { displayableTubs } from '@utils/tubs'
import axios from 'axios'
import { useRouter } from 'next/router'
import React, { useState } from 'react'
import { Button, Form } from 'react-bootstrap'

const Hire = () => {
	const router = useRouter()
	const calendar = useCalendar()
	const postcode = usePostcode()
	const [tubs, setTubs] = useState<TubDB[]>(null)

	const onSubmit: React.FormEventHandler<HTMLFormElement> = async (
		event: React.FormEvent
	) => {
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
	}

	const onSelectTub = (id: number) => {
		localStorage.setItem('tub', id.toString())
		router.push(`/checkout?tub_id=${id}`)
	}

	return (
		<div>
			<Form onSubmit={onSubmit}>
				<Calendar {...calendar} />
				<PostcodeField
					loading={postcode.loading}
					postcode={postcode.value}
					isInvalid={postcode.valid == false}
					isValid={postcode.valid}
					onChange={postcode.setValue}
					invalidMessage={postcode.message}
					onValidate={postcode.validate}
				/>
				<Button type='submit' disabled={!postcode.valid || !calendar.isValid()}>
					Submit
				</Button>
			</Form>
			{tubs?.length > 0 ? (
				<div>
					{displayableTubs(tubs).map((tub) => {
						const props = { ...tub, onClick: onSelectTub }
						return <HotTub {...props} key={tub.tub_id} />
					})}
				</div>
			) : null}
		</div>
	)
}
export default Hire
