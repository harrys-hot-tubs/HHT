import '@testing-library/jest-dom/extend-expect'
import { waitFor } from '@testing-library/react'
import { cache } from 'swr'

/** Clears the SWR cache after each test. */
afterEach(async () => {
	await waitFor(() => cache.clear())
})
