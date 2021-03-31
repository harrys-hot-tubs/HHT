import BlockedModal from '@components/postcode_modals/BlockedModal'
import RangeModal from '@components/postcode_modals/RangeModal'
import { PostcodeError } from '@utils/validators/postcodeValidator'
import React, { useEffect, useState } from 'react'

interface ComponentProps {
	invalidReason: PostcodeError
}

export interface PostcodeModalProps {
	display: boolean
	hide: () => void
}

const DISPLAYABLE: PostcodeError[] = ['range', 'blocked']

const PostcodeModal = ({ invalidReason }: ComponentProps) => {
	const [showModal, setShowModal] = useState(false)
	const props = {
		display: showModal,
		hide: () => setShowModal(false),
	}

	useEffect(() => {
		if (DISPLAYABLE.includes(invalidReason)) {
			setShowModal(true)
		}
	}, [invalidReason])

	switch (invalidReason) {
		case 'range':
			return <RangeModal {...props} />
		case 'blocked':
			return <BlockedModal {...props} />
		default:
			return null
	}
}

export default PostcodeModal
