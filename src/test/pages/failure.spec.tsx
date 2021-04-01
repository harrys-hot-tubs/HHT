import { headedRender } from '@helpers/frontendHelper'
import Failure from '@pages/failure'
import { screen, waitFor } from '@testing-library/react'
import React from 'react'

describe('failure page', () => {
	beforeEach(() => {
		headedRender(<Failure />)
	})

	it('renders title', () => {
		expect(screen.getByText(/oh no!/i)).toBeInTheDocument()
	})

	it('links to the home page', () => {
		const link = screen.getByRole('link')
		expect(link).toBeInTheDocument()
		expect(link).toHaveAttribute('href', '/')
	})

	it('sets the page title', async () => {
		await waitFor(() => expect(document.title).toEqual('Payment Unsuccessful'))
	})
})
