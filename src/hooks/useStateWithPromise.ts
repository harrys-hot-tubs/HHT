import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Hook that guarantees the state of the hook will be updated after the async update function has executed.
 *
 * @param initialState The initialState of the hook.
 * @returns A value and asynchronous update function.
 */
const useStateWithPromise = <T>(
	initialState: T
): [T, (stateAction: T) => Promise<void>] => {
	const [state, setState] = useState(initialState)
	const resolverRef = useRef(null)

	useEffect(() => {
		if (resolverRef.current) {
			resolverRef.current(state)
			resolverRef.current = null
		}
		//Uses resolverRef to guarantee handleSetState was called last render.
	}, [resolverRef.current, state])

	const handleSetState = useCallback(
		(stateAction: T): Promise<void> => {
			setState(stateAction)
			return new Promise((resolve) => {
				resolverRef.current = resolve
			})
		},
		[setState]
	)

	return [state, handleSetState]
}

export default useStateWithPromise
