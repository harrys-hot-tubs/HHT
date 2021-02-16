import React from 'react'
import { Dropdown, DropdownButton } from 'react-bootstrap'
import { SelectCallback } from 'react-bootstrap/esm/helpers'

const LocationSelector = ({
	locations,
	selected,
	updateSelected,
}: {
	locations: string[]
	selected: string
	updateSelected: SelectCallback
}) => {
	return (
		<DropdownButton title={selected}>
			{locations.map((location) => (
				<Dropdown.Item
					key={location}
					eventKey={location}
					onSelect={updateSelected}
				>
					{location}
				</Dropdown.Item>
			))}
		</DropdownButton>
	)
}

export default LocationSelector
