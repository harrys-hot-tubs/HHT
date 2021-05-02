import useStateWithPromise from '@hooks/useStateWithPromise'
import { act, renderHook } from '@testing-library/react-hooks'

it('waits for promise to be fulfilled before continuing', async () => {
	const { result } = renderHook(() => useStateWithPromise<number>(0))
	await act(async () => {
		await result.current[1](1)
	})
	const [value] = result.current
	expect(value).toBe(1)
})
