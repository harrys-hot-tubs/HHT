import insta from '@components/svg/instagram.svg'
import React from 'react'
import Icon from './index'

const InstagramIcon = () => (
	<Icon
		aria-label='instagram'
		href='https://www.instagram.com/harryshottubs'
		className='instagram-icon'
		icon={insta({})}
	/>
)

export default InstagramIcon
