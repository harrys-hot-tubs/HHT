import useCheckoutInformation, {
	CheckoutInformation,
	Fallback,
} from '@hooks/useCheckoutInformation'
import { act, renderHook } from '@testing-library/react-hooks'

const name = 'checkoutInformation'

afterEach(() => {
	localStorage.clear()
})

it('accesses stored data if available', () => {
	const storedValue = JSON.stringify({ ...Fallback, firstName: 'John' })
	localStorage.setItem(name, storedValue)

	const { result } = renderHook(() => useCheckoutInformation())
	const [value] = result.current
	expect(value).toEqual(JSON.parse(storedValue))
})

it('defaults to the fallback if no data is available', () => {
	const { result } = renderHook(() => useCheckoutInformation())
	const [value] = result.current
	expect(value).toEqual(Fallback)
})

it('sets stored data when updated', () => {
	const newValue: CheckoutInformation = { ...Fallback, lastName: 'Doe' }

	const { result } = renderHook(() => useCheckoutInformation())
	act(() => {
		result.current[1](newValue)
	})

	expect(localStorage.setItem).toHaveBeenLastCalledWith(
		name,
		JSON.stringify(newValue)
	)
})

it('sets active data when updated', () => {
	const newValue: CheckoutInformation = { ...Fallback, email: 'john@doe.com' }

	const { result } = renderHook(() => useCheckoutInformation())
	act(() => {
		result.current[1](newValue)
	})

	expect(result.current[0]).toBe(newValue)
})

it('overwrites stored data when updated', () => {
	const storedValue = JSON.stringify({
		...Fallback,
		addressLine1: '4 Privet Drive',
	})
	const nextValue: CheckoutInformation = { ...Fallback, referee: 'Facebook' }
	localStorage.setItem(name, storedValue)

	const { result } = renderHook(() => useCheckoutInformation())
	expect(result.current[0]).toEqual(JSON.parse(storedValue))
	act(() => {
		result.current[1](nextValue)
	})

	expect(localStorage.setItem).toHaveBeenLastCalledWith(
		name,
		JSON.stringify(nextValue)
	)
	expect(result.current[0]).toBe(nextValue)
})
