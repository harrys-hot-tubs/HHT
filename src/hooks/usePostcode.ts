import useAsyncValidatedInput from '@hooks/useAsyncValidatedInput'
import validatePostcode, {
	PostcodeError,
} from '@utils/validators/postcodeValidator'

/**
 * Stores and validates a user-inputted postcode asynchronously.
 */
const usePostcode = () => ({
	...useAsyncValidatedInput<string, PostcodeError>({
		validator: validatePostcode,
		key: 'postcode',
		fallback: '',
		fromString: (v) => v,
		toString: (v) => v,
	}),
})

export default usePostcode
