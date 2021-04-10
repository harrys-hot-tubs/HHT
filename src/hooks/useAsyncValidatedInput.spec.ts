import useAsyncValidatedInput, {
	UseAsyncValidatedInputArgs,
} from '@hooks/useAsyncValidatedInput'
import { act, renderHook } from '@testing-library/react-hooks'

const key = 'test'
const validator = jest.fn<Promise<[boolean, string]>, [string]>()
const params: UseAsyncValidatedInputArgs<string, string> = {
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

	const { result } = renderHook(() =>
		useAsyncValidatedInput<string, string>(params)
	)
	const { value } = result.current
	expect(value).toBe(storedValue)
})

it('defaults to the fallback if no data is available', () => {
	const { result } = renderHook(() =>
		useAsyncValidatedInput<string, string>(params)
	)
	const { value } = result.current
	expect(value).toBe(params.fallback)
})

it('sets working value when updated', () => {
	const newValue = 'newValue'

	const { result } = renderHook(() =>
		useAsyncValidatedInput<string, string>(params)
	)
	act(() => {
		result.current.setValue(newValue)
	})

	expect(result.current.value).toBe(newValue)
})

it('informs loading when validating', async () => {
	validator.mockResolvedValueOnce([true, null])

	const { result, waitForNextUpdate } = renderHook(() =>
		useAsyncValidatedInput<string, string>(params)
	)

	act(() => {
		result.current.validate()
	})

	expect(result.current.loading).toBe(true)
	await waitForNextUpdate()
	expect(result.current.loading).toBe(false)
})

it('does not store working value when validated if invalid', async () => {
	validator.mockResolvedValueOnce([false, 'Error'])

	const { result, waitForNextUpdate } = renderHook(() =>
		useAsyncValidatedInput<string, string>(params)
	)

	act(() => {
		result.current.validate()
	})
	expect(result.current.loading).toBe(true)
	await waitForNextUpdate()
	expect(result.current.loading).toBe(false)
	expect(localStorage.setItem).not.toHaveBeenCalled()
})

it('provides a reason for invalid value', async () => {
	const errorMessage = 'Error'
	validator.mockResolvedValueOnce([false, errorMessage])

	const { result, waitForNextUpdate } = renderHook(() =>
		useAsyncValidatedInput<string, string>(params)
	)

	act(() => {
		result.current.validate()
	})
	expect(result.current.loading).toBe(true)
	await waitForNextUpdate()
	expect(result.current.loading).toBe(false)
	expect(result.current.message).toEqual(errorMessage)
})

it('stores working value when validated if valid', async () => {
	validator.mockResolvedValueOnce([true, null])

	const { result, waitForNextUpdate } = renderHook(() =>
		useAsyncValidatedInput<string, string>(params)
	)

	act(() => {
		result.current.validate()
	})
	expect(result.current.loading).toBe(true)
	await waitForNextUpdate()
	expect(result.current.loading).toBe(false)
	expect(localStorage.setItem).toHaveBeenLastCalledWith(
		key,
		result.current.value
	)
})
