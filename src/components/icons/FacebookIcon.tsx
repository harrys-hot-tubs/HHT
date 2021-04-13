import Icon from '@components/icons/index'
import facebook from '@components/svg/facebook.svg'
import React from 'react'

/**
 * Facebook SVG that links to the Harry's Hot Tubs facebook page.
 */
const FacebookIcon = () => (
	<Icon
		aria-label='facebook'
		href='https://www.facebook.com/Harrys-Hot-Tubs-107531397505058'
		className='facebook-icon'
		icon={facebook({})}
	/>
)

export default FacebookIcon
