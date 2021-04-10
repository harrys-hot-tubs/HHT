import useValidatedInput, {
	UseValidatedInputArgs,
} from '@hooks/useSyncValidatedInput'
import { act, renderHook } from '@testing-library/react-hooks'

const key = 'test'
const validator = jest.fn<[boolean, string], [string]>()
const params: UseValidatedInputArgs<string, string> = {
	fallback: '',
	key,
	fromString: (v) => v,
	toString: (v) => v,
	validator,
}

afterEach(() => {
	localStorage.clear()
	jest.clearAllMocks()
})

it('access stored data if available', () => {
	const storedValue = 'storedValue'
	localStorage.setItem(key, storedValue)

	const { result } = renderHook(() => useValidatedInput<string, string>(params))
	const { value } = result.current
	expect(value).toBe(storedValue)
})

it('defaults to the fallback if no data is available', () => {
	const { result } = renderHook(() => useValidatedInput<string, string>(params))
	const { value } = result.current
	expect(value).toBe(params.fallback)
})

it('sets working value when updated', () => {
	const newValue = 'newValue'

	const { result } = renderHook(() => useValidatedInput<string, string>(params))
	act(() => {
		result.current.setValue(newValue)
	})

	expect(result.current.value).toBe(newValue)
})

it('does not store working value when validated if invalid', () => {
	validator.mockReturnValueOnce([false, 'Error'])

	const { result } = renderHook(() => useValidatedInput<string, string>(params))

	act(() => {
		result.current.validate()
	})

	expect(localStorage.setItem).not.toHaveBeenCalled()
})

it('provides a reason for invalid value', () => {
	const errorMessage = 'Error'
	validator.mockReturnValueOnce([false, errorMessage])

	const { result } = renderHook(() => useValidatedInput<string, string>(params))

	act(() => {
		result.current.validate()
	})

	expect(result.current.message).toEqual(errorMessage)
})

it('stores working value when validated if valid', () => {
	validator.mockReturnValueOnce([true, null])

	const { result } = renderHook(() => useValidatedInput<string, string>(params))

	act(() => {
		result.current.validate()
	})

	expect(localStorage.setItem).toHaveBeenLastCalledWith(
		key,
		result.current.value
	)
})
