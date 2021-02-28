import { validatePromoCode } from '../utils/validators'
import useValidatedInput from './useValidatedInput'

const usePromoCode = () =>
	useValidatedInput({
		validator: validatePromoCode,
		name: 'promoCode',
		fallback: '',
		toString: (v) => v,
		fromString: (v) => v,
	})

export default usePromoCode
