import moment from 'moment'
import { NextPageContext } from 'next'
import React, { useState } from 'react'
import { Button, Form } from 'react-bootstrap'
import Calendar from '../components/Calendar'
import LocationSelector from '../components/LocationSelector'
import { LocationDB } from '../typings/Location'
import db from '../utils/db'

const Hire = ({ locations }) => {
	const [location, setLocation] = useState('Select Location')
	return (
		<Form>
			<Form.Control autoComplete='postal-code' />
			<LocationSelector
				locations={locations}
				selected={location}
				updateSelected={setLocation}
			/>
			<Calendar isStudent={false} blockedDates={[moment('2021-02-26')]} />
			<Button type='submit'>Submit</Button>
		</Form>
	)
}

export async function getStaticProps(context: NextPageContext) {
	const locations = await db<LocationDB>('locations').select()
	const options = locations.map((loc) => loc.name)
	return {
		props: {
			locations: options,
		},
	}
}

export default Hire
