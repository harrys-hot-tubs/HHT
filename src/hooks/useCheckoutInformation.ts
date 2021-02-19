import { Dispatch, SetStateAction, useState } from 'react'

export interface CheckoutInformation {
	firstName: string
	lastName: string
	email: string
	telephoneNumber: string
	addressLine1: string
	addressLine2: string
	addressLine3: string
	specialRequests: string
}

const useCheckoutInformation = (): [
	CheckoutInformation,
	Dispatch<SetStateAction<CheckoutInformation>>
] => {
	const [checkoutInformation, setCheckoutInformation] = useState(fallback)

	return [checkoutInformation, setCheckoutInformation]
}

const fallback: CheckoutInformation = {
	firstName: '',
	lastName: '',
	email: '',
	telephoneNumber: '',
	addressLine1: '',
	addressLine2: '',
	addressLine3: '',
	specialRequests: '',
}

export default useCheckoutInformation
