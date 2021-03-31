import useValidatedInput from '@hooks/useSyncValidatedInput'
import { validatePromoCode } from '@utils/validators'

const usePromoCode = () =>
	useValidatedInput({
		validator: validatePromoCode,
		name: 'promoCode',
		fallback: '',
		toString: (v) => v,
		fromString: (v) => v,
	})

export default usePromoCode
