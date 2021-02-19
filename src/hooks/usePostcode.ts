import { validatePostcode } from '../utils/validators'
import useAsyncValidatedInput from './useAsyncValidatedInput'

const usePostcode = () => ({
	...useAsyncValidatedInput<string>({
		validator: validatePostcode,
		name: 'postcode',
		fallback: '',
		fromString: (v) => v,
		toString: (v) => v,
	}),
})

export default usePostcode
