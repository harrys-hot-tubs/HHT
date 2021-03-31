import usePromoCode from '@hooks/usePromoCode'
import { jest } from '@jest/globals'
import { act, renderHook } from '@testing-library/react-hooks'
import { validatePromoCode } from '@utils/validators'

const mockValidator = validatePromoCode as jest.Mock

jest.mock('@utils/validators')

const name = 'promoCode'

afterEach(() => {
	localStorage.clear()
	jest.clearAllMocks()
})

it('accesses stored data if available', () => {
	const storedValue = 'TEST2020'
	localStorage.setItem(name, storedValue)

	const { result } = renderHook(() => usePromoCode())
	const { value } = result.current
	expect(value).toBe(storedValue)
})

it('defaults to the fallback if no data is available', () => {
	const { result } = renderHook(() => usePromoCode())
	const { value } = result.current
	expect(value).toBe('')
})

it('sets working value when updated', () => {
	const newValue = 'PALS5'

	const { result } = renderHook(() => usePromoCode())
	act(() => {
		result.current.setValue(newValue)
	})

	expect(result.current.value).toBe(newValue)
})

it('sets active data when updated', () => {
	const newValue = 'NEWCODE'

	const { result } = renderHook(() => usePromoCode())
	act(() => {
		result.current.setValue(newValue)
	})

	expect(result.current.value).toBe(newValue)
})

it('does not store working value when validated if invalid', async () => {
	const errorMessage = 'invalid'
	mockValidator.mockReturnValueOnce([false, errorMessage])

	const { result } = renderHook(() => usePromoCode())

	act(() => {
		result.current.validate()
	})

	expect(localStorage.setItem).not.toHaveBeenCalled()
})

it('provides a reason for invalid value', async () => {
	const errorMessage = 'invalid'
	mockValidator.mockReturnValueOnce([false, errorMessage])

	const { result } = renderHook(() => usePromoCode())

	act(() => {
		result.current.validate()
	})

	expect(result.current.message).toEqual(errorMessage)
})

it('stores working value when validated if valid', async () => {
	mockValidator.mockReturnValueOnce([true, null])

	const { result } = renderHook(() => usePromoCode())

	act(() => {
		result.current.validate()
	})

	expect(localStorage.setItem).toHaveBeenLastCalledWith(
		name,
		result.current.value
	)
})
