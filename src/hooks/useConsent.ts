import useStoredStateWithExpiration from '@hooks/useStoredStateWithExpiration'

/**
 * Storage of whether or not the customer consents to tracking cookies.
 */
const useConsent = () =>
	useStoredStateWithExpiration<boolean>({
		fallback: undefined,
		key: 'consent',
		toString: (v) => v.toString(),
		fromString: (v) => v === 'true',
		isType: (v: unknown): v is boolean => typeof v === 'boolean',
	})

export default useConsent
