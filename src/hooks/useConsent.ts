import useStoredState from '@hooks/useStoredState'

/**
 * Storage of whether or not the customer consents to tracking cookies.
 */
const useConsent = () =>
	useStoredState<boolean>({
		fallback: undefined,
		key: 'consent',
		toString: (v) => v.toString(),
		fromString: (v) => v === 'true',
	})

export default useConsent
