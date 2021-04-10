import useStoredState, { UseStoredStateArgs } from '@hooks/useStoredState'
import { act, renderHook } from '@testing-library/react-hooks'

const key = 'test'

afterEach(() => {
	localStorage.clear()
})

describe('numbers', () => {
	const params: UseStoredStateArgs<number> = {
		fallback: 0,
		key,
		fromString: (v) => Number(v),
		toString: (v) => v.toString(),
	}

	it('accesses stored data if available', () => {
		const storedValue = '1'
		localStorage.setItem(key, storedValue)

		const { result } = renderHook(() => useStoredState<number>(params))
		const [value] = result.current
		expect(value).toBe(Number(storedValue))
	})

	it('defaults to the fallback if no data is available', () => {
		const { result } = renderHook(() => useStoredState<number>(params))
		const [value] = result.current
		expect(value).toBe(params.fallback)
	})

	it('sets stored data when updated', () => {
		const newValue = 17

		const { result } = renderHook(() => useStoredState<number>(params))
		act(() => {
			result.current[1](newValue)
		})

		expect(localStorage.setItem).toHaveBeenLastCalledWith(key, String(newValue))
	})

	it('sets active data when updated', () => {
		const newValue = 17

		const { result } = renderHook(() => useStoredState<number>(params))
		act(() => {
			result.current[1](newValue)
		})

		expect(result.current[0]).toBe(newValue)
	})

	it('overwrites stored data when updated', () => {
		const storedValue = '17'
		const newValue = 22
		localStorage.setItem(key, storedValue)

		const { result } = renderHook(() => useStoredState<number>(params))
		expect(result.current[0]).toBe(Number(storedValue))
		act(() => {
			result.current[1](newValue)
		})

		expect(localStorage.setItem).toHaveBeenLastCalledWith(key, String(newValue))
		expect(result.current[0]).toBe(newValue)
	})
})

describe('booleans', () => {
	const params: UseStoredStateArgs<boolean> = {
		fallback: undefined,
		key: key,
		fromString: (v) => v === 'true',
		toString: (v) => v.toString(),
	}

	it('accesses stored data if available', () => {
		const storedValue = 'false'
		localStorage.setItem(key, storedValue)

		const { result } = renderHook(() => useStoredState<boolean>(params))
		const [value] = result.current
		expect(value).toBe(false)
	})

	it('defaults to the fallback if no data is available', () => {
		const { result } = renderHook(() => useStoredState<boolean>(params))
		const [value] = result.current
		expect(value).toBe(params.fallback)
	})

	it('sets stored data when updated', () => {
		const newValue = false

		const { result } = renderHook(() => useStoredState<boolean>(params))
		act(() => {
			result.current[1](newValue)
		})

		expect(localStorage.setItem).toHaveBeenLastCalledWith(key, String(newValue))
	})

	it('sets active data when updated', () => {
		const newValue = true

		const { result } = renderHook(() => useStoredState<boolean>(params))
		act(() => {
			result.current[1](newValue)
		})

		expect(result.current[0]).toBe(newValue)
	})

	it('overwrites stored data when updated', () => {
		const storedValue = 'false'
		const nextValue = true
		localStorage.setItem(key, storedValue)

		const { result } = renderHook(() => useStoredState<boolean>(params))
		expect(result.current[0]).toBe(false)
		act(() => {
			result.current[1](nextValue)
		})

		expect(localStorage.setItem).toHaveBeenLastCalledWith(
			key,
			String(nextValue)
		)
		expect(result.current[0]).toBe(nextValue)
	})
})

describe('arrays', () => {
	const params: UseStoredStateArgs<string[]> = {
		fallback: [],
		key: key,
		fromString: (v) => v.split(','),
		toString: (v) => v.toString(),
	}

	it('accesses stored data if available', () => {
		const storedValue = 'a,b'
		localStorage.setItem(key, storedValue)

		const { result } = renderHook(() => useStoredState<string[]>(params))
		const [value] = result.current
		expect(value).toEqual(storedValue.split(','))
	})

	it('defaults to the fallback if no data is available', () => {
		const { result } = renderHook(() => useStoredState<string[]>(params))
		const [value] = result.current
		expect(value).toEqual(params.fallback)
	})

	it('sets stored data when updated', () => {
		const newValue = ['b', 'a']

		const { result } = renderHook(() => useStoredState<string[]>(params))
		act(() => {
			result.current[1](newValue)
		})

		expect(localStorage.setItem).toHaveBeenLastCalledWith(
			key,
			newValue.toString()
		)
	})

	it('sets active data when updated', () => {
		const newValue = ['c', 'd']

		const { result } = renderHook(() => useStoredState<string[]>(params))
		act(() => {
			result.current[1](newValue)
		})

		expect(result.current[0]).toBe(newValue)
	})

	it('overwrites stored data when updated', () => {
		const storedValue = 'e,f'
		const nextValue = ['g', 'h']
		localStorage.setItem(key, storedValue)

		const { result } = renderHook(() => useStoredState<string[]>(params))
		expect(result.current[0]).toEqual(storedValue.split(','))
		act(() => {
			result.current[1](nextValue)
		})

		expect(localStorage.setItem).toHaveBeenLastCalledWith(
			key,
			nextValue.toString()
		)
		expect(result.current[0]).toBe(nextValue)
	})
})

describe('objects', () => {
	interface StorableObject {
		foo: string
		bar: number
		bash: boolean
	}

	const params: UseStoredStateArgs<StorableObject> = {
		fallback: {
			foo: null,
			bar: null,
			bash: null,
		},
		key: key,
		fromString: (v) => JSON.parse(v) as StorableObject,
		toString: (v) => JSON.stringify(v),
	}

	it('accesses stored data if available', () => {
		const storedValue = JSON.stringify({
			foo: 'as',
			bar: 76,
			bash: false,
		})
		localStorage.setItem(key, storedValue)

		const { result } = renderHook(() => useStoredState<StorableObject>(params))
		const [value] = result.current
		expect(value).toEqual(JSON.parse(storedValue))
	})

	it('defaults to the fallback if no data is available', () => {
		const { result } = renderHook(() => useStoredState<StorableObject>(params))
		const [value] = result.current
		expect(value).toEqual(params.fallback)
	})

	it('sets stored data when updated', () => {
		const newValue = {
			foo: 'as',
			bar: 76,
			bash: false,
		}

		const { result } = renderHook(() => useStoredState<StorableObject>(params))
		act(() => {
			result.current[1](newValue)
		})

		expect(localStorage.setItem).toHaveBeenLastCalledWith(
			key,
			JSON.stringify(newValue)
		)
	})

	it('sets active data when updated', () => {
		const newValue = {
			foo: 'as',
			bar: 76,
			bash: undefined,
		}

		const { result } = renderHook(() => useStoredState<StorableObject>(params))
		act(() => {
			result.current[1](newValue)
		})

		expect(result.current[0]).toBe(newValue)
	})

	it('overwrites stored data when updated', () => {
		const storedValue = JSON.stringify({
			foo: 'as',
			bar: 76,
			bash: undefined,
		})
		const nextValue = {
			foo: 'asdasd',
			bar: -324897,
			bash: true,
		}
		localStorage.setItem(key, storedValue)

		const { result } = renderHook(() => useStoredState<StorableObject>(params))
		expect(result.current[0]).toEqual(JSON.parse(storedValue))
		act(() => {
			result.current[1](nextValue)
		})

		expect(localStorage.setItem).toHaveBeenLastCalledWith(
			key,
			JSON.stringify(nextValue)
		)
		expect(result.current[0]).toBe(nextValue)
	})
})
