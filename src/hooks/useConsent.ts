import useStoredState from '@hooks/useStoredState'

const useConsent = () =>
	useStoredState<boolean>({
		fallback: undefined,
		name: 'consent',
		toString: (v) => v.toString(),
		fromString: (v) => v === 'true',
	})

export default useConsent
