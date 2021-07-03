import useStoredStateWithExpiration, {
	UseStoredStateWithExpirationArgs,
	ValueWithExpiration,
} from '@hooks/useStoredStateWithExpiration'
import { act, renderHook } from '@testing-library/react-hooks'

const key = 'test'

afterEach(() => {
	localStorage.clear()
})

describe('numbers', () => {
	const params: UseStoredStateWithExpirationArgs<number> = {
		fallback: 0,
		key,
		fromString: (v) => Number(v),
		toString: (v) => v.toString(),
		isType: (v: unknown): v is number =>
			typeof v === 'number' &&
			v === Number(v) &&
			(v !== Infinity || v === Infinity),
	}

	it('accesses stored data if available', () => {
		const stored: ValueWithExpiration = {
			value: '1',
			exp: Date.now() + 3600 * 1000,
		}
		localStorage.setItem(key, JSON.stringify(stored))

		const { result } = renderHook(() =>
			useStoredStateWithExpiration<number>(params)
		)
		const [value] = result.current
		expect(value).toBe(Number(stored.value))
	})

	it('defaults to the fallback if no data is available', () => {
		const { result } = renderHook(() =>
			useStoredStateWithExpiration<number>(params)
		)
		const [value] = result.current
		expect(value).toBe(params.fallback)
	})

	it('sets stored data when updated', () => {
		const newValue = 17

		const { result } = renderHook(() =>
			useStoredStateWithExpiration<number>(params)
		)
		act(() => {
			result.current[1](newValue)
		})

		expect(localStorage.setItem).toHaveBeenLastCalledWith(
			key,
			expect.stringContaining(`"value":"${newValue}"`)
		)
	})

	it('sets active data when updated', () => {
		const newValue = 17

		const { result } = renderHook(() =>
			useStoredStateWithExpiration<number>(params)
		)
		act(() => {
			result.current[1](newValue)
		})

		expect(result.current[0]).toBe(newValue)
	})

	it('overwrites stored data when updated', () => {
		const stored: ValueWithExpiration = {
			value: '17',
			exp: Date.now() + 3600 * 1000,
		}
		const newValue = 22
		localStorage.setItem(key, JSON.stringify(stored))

		const { result } = renderHook(() =>
			useStoredStateWithExpiration<number>(params)
		)
		expect(result.current[0]).toBe(Number(stored.value))
		act(() => {
			result.current[1](newValue)
		})

		expect(localStorage.setItem).toHaveBeenLastCalledWith(
			key,
			expect.stringContaining(`"value":"${newValue}"`)
		)
		expect(result.current[0]).toBe(newValue)
	})

	it('reverts to fallback and removes value from localstorage on reset', () => {
		const stored: ValueWithExpiration = {
			value: '17',
			exp: Date.now() + 3600 * 1000,
		}
		localStorage.setItem(key, JSON.stringify(stored))

		const { result } = renderHook(() =>
			useStoredStateWithExpiration<number>(params)
		)
		expect(result.current[0]).toBe(Number(stored.value))
		act(() => {
			result.current[2]()
		})

		expect(localStorage.removeItem).toHaveBeenLastCalledWith(key)
		expect(result.current[0]).toBe(params.fallback)
	})

	it('reverts to fallback if the value is invalid', () => {
		const stored: ValueWithExpiration = {
			value: 'lemon',
			exp: Date.now() + 3600 * 1000,
		}
		localStorage.setItem(key, JSON.stringify(stored))

		const { result } = renderHook(() =>
			useStoredStateWithExpiration<number>(params)
		)

		expect(localStorage.removeItem).toHaveBeenLastCalledWith(key)
		expect(result.current[0]).toBe(params.fallback)
	})

	it('reverts to fallback if the value is expired', () => {
		const stored: ValueWithExpiration = {
			value: '17',
			exp: Date.now() - 3600 * 1000,
		}
		localStorage.setItem(key, JSON.stringify(stored))

		const { result } = renderHook(() =>
			useStoredStateWithExpiration<number>(params)
		)

		expect(localStorage.removeItem).toHaveBeenLastCalledWith(key)
		expect(result.current[0]).toBe(params.fallback)
	})

	it('reverts to fallback if the value is expired and is invalid', () => {
		const stored: ValueWithExpiration = {
			value: 'x',
			exp: Date.now() - 3600 * 1000,
		}
		localStorage.setItem(key, JSON.stringify(stored))

		const { result } = renderHook(() =>
			useStoredStateWithExpiration<number>(params)
		)

		expect(localStorage.removeItem).toHaveBeenLastCalledWith(key)
		expect(result.current[0]).toBe(params.fallback)
	})
})

describe('booleans', () => {
	const params: UseStoredStateWithExpirationArgs<boolean> = {
		fallback: undefined,
		key: key,
		fromString: (v) => v === 'true',
		toString: (v) => v.toString(),
		isType: (v: unknown): v is boolean => typeof v === 'boolean',
	}

	it('accesses stored data if available', () => {
		const stored: ValueWithExpiration = {
			value: 'false',
			exp: Date.now() + 3600 * 1000,
		}
		localStorage.setItem(key, JSON.stringify(stored))

		const { result } = renderHook(() =>
			useStoredStateWithExpiration<boolean>(params)
		)
		const [value] = result.current
		expect(value).toBe(false)
	})

	it('defaults to the fallback if no data is available', () => {
		const { result } = renderHook(() =>
			useStoredStateWithExpiration<boolean>(params)
		)
		const [value] = result.current
		expect(value).toBe(params.fallback)
	})

	it('sets stored data when updated', () => {
		const newValue = false

		const { result } = renderHook(() =>
			useStoredStateWithExpiration<boolean>(params)
		)
		act(() => {
			result.current[1](newValue)
		})

		expect(localStorage.setItem).toHaveBeenLastCalledWith(
			key,
			expect.stringContaining(`"value":"${newValue}"`)
		)
	})

	it('sets active data when updated', () => {
		const newValue = true

		const { result } = renderHook(() =>
			useStoredStateWithExpiration<boolean>(params)
		)
		act(() => {
			result.current[1](newValue)
		})

		expect(result.current[0]).toBe(newValue)
	})

	it('overwrites stored data when updated', () => {
		const stored: ValueWithExpiration = {
			value: 'false',
			exp: Date.now() + 3600 * 1000,
		}
		const next = true
		localStorage.setItem(key, JSON.stringify(stored))

		const { result } = renderHook(() =>
			useStoredStateWithExpiration<boolean>(params)
		)
		expect(result.current[0]).toBe(false)
		act(() => {
			result.current[1](next)
		})

		expect(localStorage.setItem).toHaveBeenLastCalledWith(
			key,
			expect.stringContaining(`"value":"${next}"`)
		)
		expect(result.current[0]).toBe(next)
	})

	it('reverts to fallback and removes value from localstorage on reset', () => {
		const stored: ValueWithExpiration = {
			value: 'false',
			exp: Date.now() + 3600 * 1000,
		}
		localStorage.setItem(key, JSON.stringify(stored))

		const { result } = renderHook(() =>
			useStoredStateWithExpiration<boolean>(params)
		)
		expect(result.current[0]).toBe(false)
		act(() => {
			result.current[2]()
		})

		expect(localStorage.removeItem).toHaveBeenLastCalledWith(key)
		expect(result.current[0]).toBe(params.fallback)
	})

	it('returns false if the value is invalid', () => {
		const stored: ValueWithExpiration = {
			value: 'lemon',
			exp: Date.now() + 3600 * 1000,
		}
		localStorage.setItem(key, JSON.stringify(stored))

		const { result } = renderHook(() =>
			useStoredStateWithExpiration<boolean>(params)
		)

		expect(localStorage.removeItem).toHaveBeenLastCalledWith(key)
		expect(result.current[0]).toBe(false)
	})

	it('reverts to fallback if the value is expired', () => {
		const stored: ValueWithExpiration = {
			value: 'false',
			exp: Date.now() - 3600 * 1000,
		}
		localStorage.setItem(key, JSON.stringify(stored))

		const { result } = renderHook(() =>
			useStoredStateWithExpiration<boolean>(params)
		)

		expect(localStorage.removeItem).toHaveBeenLastCalledWith(key)
		expect(result.current[0]).toBe(params.fallback)
	})

	it('reverts to fallback if the value is expired and is invalid', () => {
		const stored: ValueWithExpiration = {
			value: 'x',
			exp: Date.now() - 3600 * 1000,
		}
		localStorage.setItem(key, JSON.stringify(stored))

		const { result } = renderHook(() =>
			useStoredStateWithExpiration<boolean>(params)
		)

		expect(localStorage.removeItem).toHaveBeenLastCalledWith(key)
		expect(result.current[0]).toBe(params.fallback)
	})
})

describe('arrays', () => {
	const params: UseStoredStateWithExpirationArgs<string[]> = {
		fallback: [],
		key: key,
		fromString: (v) => v.split(','),
		toString: (v) => v.toString(),
		isType: (v: unknown): v is string[] =>
			Array.isArray(v) && v.every((element) => typeof element === 'string'),
	}

	it('accesses stored data if available', () => {
		const stored: ValueWithExpiration = {
			value: 'a,b',
			exp: Date.now() + 3600 * 1000,
		}
		localStorage.setItem(key, JSON.stringify(stored))

		const { result } = renderHook(() =>
			useStoredStateWithExpiration<string[]>(params)
		)
		const [value] = result.current
		expect(value).toStrictEqual(stored.value.split(','))
	})

	it('defaults to the fallback if no data is available', () => {
		const { result } = renderHook(() =>
			useStoredStateWithExpiration<string[]>(params)
		)
		const [value] = result.current
		expect(value).toStrictEqual(params.fallback)
	})

	it('sets stored data when updated', () => {
		const value = ['b', 'a']

		const { result } = renderHook(() =>
			useStoredStateWithExpiration<string[]>(params)
		)
		act(() => {
			result.current[1](value)
		})

		expect(localStorage.setItem).toHaveBeenLastCalledWith(
			key,
			expect.stringContaining(`"value":"${value.toString()}"`)
		)
	})

	it('sets active data when updated', () => {
		const value = ['c', 'd']

		const { result } = renderHook(() =>
			useStoredStateWithExpiration<string[]>(params)
		)
		act(() => {
			result.current[1](value)
		})

		expect(result.current[0]).toBe(value)
	})

	it('overwrites stored data when updated', () => {
		const stored: ValueWithExpiration = {
			value: 'e,f',
			exp: Date.now() + 3600 * 1000,
		}
		const next = ['g', 'h']
		localStorage.setItem(key, JSON.stringify(stored))

		const { result } = renderHook(() =>
			useStoredStateWithExpiration<string[]>(params)
		)
		expect(result.current[0]).toStrictEqual(stored.value.split(','))
		act(() => {
			result.current[1](next)
		})

		expect(localStorage.setItem).toHaveBeenLastCalledWith(
			key,
			expect.stringContaining(`"value":"${next.toString()}"`)
		)
		expect(result.current[0]).toBe(next)
	})

	it('reverts to fallback and removes value from localstorage on reset', () => {
		const stored: ValueWithExpiration = {
			value: 'e,f',
			exp: Date.now() + 3600 * 1000,
		}
		localStorage.setItem(key, JSON.stringify(stored))

		const { result } = renderHook(() =>
			useStoredStateWithExpiration<string[]>(params)
		)
		expect(result.current[0]).toStrictEqual(stored.value.split(','))
		act(() => {
			result.current[2]()
		})

		expect(localStorage.removeItem).toHaveBeenLastCalledWith(key)
		expect(result.current[0]).toStrictEqual(params.fallback)
	})

	it('reverts to fallback if the value is invalid', () => {
		const stored: ValueWithExpiration = {
			value: null,
			exp: Date.now() + 3600 * 1000,
		}
		localStorage.setItem(key, JSON.stringify(stored))

		const { result } = renderHook(() =>
			useStoredStateWithExpiration<string[]>(params)
		)

		expect(localStorage.removeItem).toHaveBeenLastCalledWith(key)
		expect(result.current[0]).toBe(params.fallback)
	})

	it('reverts to fallback if the value is expired', () => {
		const stored: ValueWithExpiration = {
			value: 'a,b',
			exp: Date.now() - 3600 * 1000,
		}
		localStorage.setItem(key, JSON.stringify(stored))

		const { result } = renderHook(() =>
			useStoredStateWithExpiration<string[]>(params)
		)

		expect(localStorage.removeItem).toHaveBeenLastCalledWith(key)
		expect(result.current[0]).toBe(params.fallback)
	})

	it('reverts to fallback if the value is expired and is invalid', () => {
		const stored: ValueWithExpiration = {
			value: '7',
			exp: Date.now() - 3600 * 1000,
		}
		localStorage.setItem(key, JSON.stringify(stored))

		const { result } = renderHook(() =>
			useStoredStateWithExpiration<string[]>(params)
		)

		expect(localStorage.removeItem).toHaveBeenLastCalledWith(key)
		expect(result.current[0]).toBe(params.fallback)
	})
})

describe('objects', () => {
	interface StorableObject {
		foo: string
		bar: number
		bash: boolean
	}

	const params: UseStoredStateWithExpirationArgs<StorableObject> = {
		fallback: {
			foo: null,
			bar: null,
			bash: null,
		},
		key: key,
		fromString: (v) => JSON.parse(v) as StorableObject,
		toString: (v) => JSON.stringify(v),
		isType: (v: unknown): v is StorableObject =>
			Object.keys(v).length === 3 &&
			typeof (v as StorableObject).foo === 'string' &&
			typeof (v as StorableObject).bar === 'number' &&
			typeof (v as StorableObject).bash === 'boolean',
	}

	it('accesses stored data if available', () => {
		const stored: ValueWithExpiration = {
			value: JSON.stringify({
				foo: 'as',
				bar: 76,
				bash: false,
			}),
			exp: Date.now() + 3600 * 1000,
		}
		localStorage.setItem(key, JSON.stringify(stored))

		const { result } = renderHook(() =>
			useStoredStateWithExpiration<StorableObject>(params)
		)
		const [value] = result.current
		expect(value).toStrictEqual(JSON.parse(stored.value))
	})

	it('defaults to the fallback if no data is available', () => {
		const { result } = renderHook(() =>
			useStoredStateWithExpiration<StorableObject>(params)
		)
		const [value] = result.current
		expect(value).toStrictEqual(params.fallback)
	})

	it('sets stored data when updated', () => {
		const value = {
			foo: 'as',
			bar: 76,
			bash: false,
		}

		const { result } = renderHook(() =>
			useStoredStateWithExpiration<StorableObject>(params)
		)
		act(() => {
			result.current[1](value)
		})

		expect(localStorage.setItem).toHaveBeenLastCalledWith(
			key,
			expect.stringContaining(
				`${JSON.stringify({ value: JSON.stringify(value) }).substr(
					0,
					length - 1
				)}`
			)
		)
	})

	it('sets active data when updated', () => {
		const value = {
			foo: 'as',
			bar: 76,
			bash: undefined,
		}

		const { result } = renderHook(() =>
			useStoredStateWithExpiration<StorableObject>(params)
		)
		act(() => {
			result.current[1](value)
		})

		expect(result.current[0]).toStrictEqual(value)
	})

	it('overwrites stored data when updated', () => {
		const stored: ValueWithExpiration = {
			value: JSON.stringify({
				foo: 'as',
				bar: 76,
				bash: false,
			}),
			exp: Date.now() + 3600 * 1000,
		}
		const next = {
			foo: 'asdasd',
			bar: -324897,
			bash: true,
		}
		localStorage.setItem(key, JSON.stringify(stored))

		const { result } = renderHook(() =>
			useStoredStateWithExpiration<StorableObject>(params)
		)
		expect(result.current[0]).toStrictEqual(JSON.parse(stored.value))
		act(() => {
			result.current[1](next)
		})

		expect(localStorage.setItem).toHaveBeenLastCalledWith(
			key,
			expect.stringContaining(
				`${JSON.stringify({ value: JSON.stringify(next) }).substr(
					0,
					length - 1
				)}`
			)
		)
		expect(result.current[0]).toBe(next)
	})

	it('reverts to fallback and removes value from localstorage on reset', () => {
		const stored: ValueWithExpiration = {
			value: JSON.stringify({
				foo: 'as',
				bar: 76,
				bash: false,
			}),
			exp: Date.now() + 3600 * 1000,
		}
		localStorage.setItem(key, JSON.stringify(stored))

		const { result } = renderHook(() =>
			useStoredStateWithExpiration<StorableObject>(params)
		)
		expect(result.current[0]).toStrictEqual(JSON.parse(stored.value))
		act(() => {
			result.current[2]()
		})

		expect(localStorage.removeItem).toHaveBeenLastCalledWith(key)
		expect(result.current[0]).toStrictEqual(params.fallback)
	})

	it('reverts to fallback if the value is invalid', () => {
		const stored: ValueWithExpiration = {
			value: '32',
			exp: Date.now() + 3600 * 1000,
		}
		localStorage.setItem(key, JSON.stringify(stored))

		const { result } = renderHook(() =>
			useStoredStateWithExpiration<StorableObject>(params)
		)

		expect(localStorage.removeItem).toHaveBeenLastCalledWith(key)
		expect(result.current[0]).toBe(params.fallback)
	})

	it('reverts to fallback if the value is expired', () => {
		const stored: ValueWithExpiration = {
			value: 'a,b',
			exp: Date.now() - 3600 * 1000,
		}
		localStorage.setItem(key, JSON.stringify(stored))

		const { result } = renderHook(() =>
			useStoredStateWithExpiration<StorableObject>(params)
		)

		expect(localStorage.removeItem).toHaveBeenLastCalledWith(key)
		expect(result.current[0]).toBe(params.fallback)
	})

	it('reverts to fallback if the value is expired and is invalid', () => {
		const stored: ValueWithExpiration = {
			value: JSON.stringify({
				foo: 'as',
				bar: 76,
				bash: undefined,
			}),
			exp: Date.now() - 3600 * 1000,
		}
		localStorage.setItem(key, JSON.stringify(stored))

		const { result } = renderHook(() =>
			useStoredStateWithExpiration<StorableObject>(params)
		)

		expect(localStorage.removeItem).toHaveBeenLastCalledWith(key)
		expect(result.current[0]).toBe(params.fallback)
	})
})
