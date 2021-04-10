import Icon from '@components/icons/index'
import insta from '@components/svg/instagram.svg'
import React from 'react'

/**
 * Instagram SVG that links to the Harry's Hot Tubs instagram page.
 */
const InstagramIcon = () => (
	<Icon
		aria-label='instagram'
		href='https://www.instagram.com/harryshottubs'
		className='instagram-icon'
		icon={insta({})}
	/>
)

export default InstagramIcon
