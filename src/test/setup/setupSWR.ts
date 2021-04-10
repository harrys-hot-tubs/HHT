import '@testing-library/jest-dom/extend-expect'
import { waitFor } from '@testing-library/react'
import { cache } from 'swr'

afterEach(async () => {
	await waitFor(() => cache.clear())
})
