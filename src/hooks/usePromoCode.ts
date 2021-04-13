import useValidatedInput from '@hooks/useSyncValidatedInput'
import validatePromoCode from '@utils/validators/promoCodeValidator'

/**
 * Stores and synchronously validates a user-inputted promotional code.
 */
const usePromoCode = () =>
	useValidatedInput({
		validator: validatePromoCode,
		key: 'promoCode',
		fallback: '',
		toString: (v) => v,
		fromString: (v) => v,
	})

export default usePromoCode
