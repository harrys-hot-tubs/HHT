import useAsyncValidatedInput from '@hooks/useAsyncValidatedInput'
import { validatePostcode } from '@utils/validators'

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
