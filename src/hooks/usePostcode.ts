import useAsyncValidatedInput from '@hooks/useAsyncValidatedInput'
import { PostcodeError, validatePostcode } from '@utils/validators'

const usePostcode = () => ({
	...useAsyncValidatedInput<string, PostcodeError>({
		validator: validatePostcode,
		name: 'postcode',
		fallback: '',
		fromString: (v) => v,
		toString: (v) => v,
	}),
})

export default usePostcode
