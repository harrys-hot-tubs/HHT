import useStoredState from '@hooks/useStoredState'
import { Dispatch, SetStateAction } from 'react'

export interface CheckoutInformation {
	firstName: string
	lastName: string
	email: string
	telephoneNumber: string
	addressLine1: string
	addressLine2: string
	addressLine3: string
	referee: string
	specialRequests: string
}

const useCheckoutInformation = (): [
	CheckoutInformation,
	Dispatch<SetStateAction<CheckoutInformation>>
] => {
	const [checkoutInformation, setCheckoutInformation] = useStoredState({
		name: 'checkoutInformation',
		fallback,
		toString: (v) => JSON.stringify(v),
		fromString: (v) => JSON.parse(v) as CheckoutInformation,
	})

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
	referee: '',
	specialRequests: '',
}

export default useCheckoutInformation
