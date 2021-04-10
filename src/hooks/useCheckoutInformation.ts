import useStoredState from '@hooks/useStoredState'
import { Dispatch, SetStateAction } from 'react'

export interface CheckoutInformation {
	/**
	 * The customer's first name.
	 */
	firstName: string
	/**
	 * The customer's last name.
	 */
	lastName: string
	/**
	 * The customer's email address.
	 */
	email: string
	/**
	 * The customer's telephone number.
	 */
	telephoneNumber: string
	/**
	 * The first line of the customer's address.
	 */
	addressLine1: string
	/**
	 * The second line of the customer's address.
	 */
	addressLine2: string
	/**
	 * The third line of the customer's address.
	 */
	addressLine3: string
	/**
	 * Who or what referred the customer to use Harry's Hot Tubs.
	 */
	referee: string
	/**
	 * Any particular requirements the customer may have.
	 */
	specialRequests: string
}

/**
 * Hook allowing the storage of the customer's information necessary for them to make bookings.
 */
const useCheckoutInformation = (): [
	CheckoutInformation,
	Dispatch<SetStateAction<CheckoutInformation>>
] => {
	const [checkoutInformation, setCheckoutInformation] = useStoredState({
		key: 'checkoutInformation',
		fallback: Fallback,
		toString: (v) => JSON.stringify(v),
		fromString: (v) => JSON.parse(v) as CheckoutInformation,
	})

	return [checkoutInformation, setCheckoutInformation]
}

export const Fallback: CheckoutInformation = {
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
