import BlockedModal from '@components/postcode_modals/BlockedModal'
import RangeModal from '@components/postcode_modals/RangeModal'
import { PostcodeError } from '@utils/validators/postcodeValidator'
import React, { useEffect, useState } from 'react'
import InsuranceModal from './InsuranceModal'

interface ComponentProps {
	invalidReason: PostcodeError
}

export interface PostcodeModalProps {
	display: boolean
	hide: () => void
}

const DISPLAYABLE: PostcodeError[] = ['range', 'blocked', 'insurance']

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
		case 'insurance':
			return <InsuranceModal {...props} />
		default:
			return null
	}
}

export default PostcodeModal
