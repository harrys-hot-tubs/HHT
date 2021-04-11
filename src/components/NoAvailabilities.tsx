import React from 'react'

/**
 * Message displayed to the user if there are no bookings available at the location chosen over the time chosen.
 */
const NoAvailabilities = () => (
	<div className='no-availabilities'>
		<h5>Oops, no availability on these dates.</h5>
		<p>
			Get in touch on <a href='tel:07554002075'>07554&nbsp;002&nbsp;075</a> for
			alternative dates.
		</p>
	</div>
)

export default NoAvailabilities
