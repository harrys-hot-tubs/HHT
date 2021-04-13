import BlockedModal from '@components/postcode_modals/BlockedModal'
import RangeModal from '@components/postcode_modals/RangeModal'
import { PostcodeError } from '@utils/validators/postcodeValidator'
import React, { useEffect, useState } from 'react'

interface ComponentProps {
	/**
	 * The reason that delivery is not available to the customer.
	 */
	invalidReason: PostcodeError
}

export interface PostcodeModalProps {
	/**
	 * True if the modal is visible.
	 */
	display: boolean
	/**
	 * Function to make the modal invisible.
	 */
	hide: () => void
}

/**
 * All errors with currently supported modals.
 */
const DISPLAYABLE: PostcodeError[] = ['range', 'blocked']

/**
 * Generic modal to be displayed to the customer when an error is encountered when checking if delivery is available to their address.
 */
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
