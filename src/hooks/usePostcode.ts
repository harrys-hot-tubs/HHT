import useAsyncValidatedInput from '@hooks/useAsyncValidatedInput'
import validatePostcode, {
	PostcodeError,
} from '@utils/validators/postcodeValidator'

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
