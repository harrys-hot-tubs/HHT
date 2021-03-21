import { headedRender } from '@helpers/frontendHelper'
import { mockUseRouter } from '@helpers/routerHelper'
import Index from '@pages/index'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/router'
import React from 'react'

const actions = mockUseRouter({})

describe('home page', () => {
	beforeEach(() => {
		headedRender(<Index />)
	})

	it('renders title', () => {
		const title = screen.getByRole('heading', { level: 1 })
		expect(title).toBeInTheDocument()
		expect(title.textContent).toEqual("Harry's Hot Tubs")
	})

	it('links to hire page', async () => {
		await waitFor(() => expect(useRouter).toHaveBeenCalled())
		await waitFor(() => expect(actions.prefetch).toHaveBeenCalledWith('/hire'))

		const link = screen.getByRole('link', { name: 'hire' })
		expect(link).toBeInTheDocument()
		expect(link.textContent).toEqual('Hire a Hot Tub')

		userEvent.click(link)
		expect(actions.push).toHaveBeenCalledWith('/hire')
	})

	it('links to privacy policy', () => {
		const link = screen.getByRole('link', { name: 'privacy policy' })
		expect(link).toBeInTheDocument()
		expect(link).toHaveAttribute('href', '/docs/Privacy Policy.pdf')
	})

	it('links to FAQs', () => {
		const link = screen.getByRole('link', { name: 'FAQs' })
		expect(link).toBeInTheDocument()
		expect(link).toHaveAttribute('href', '/docs/FAQs.pdf')
	})

	it('links to terms and conditions', () => {
		const link = screen.getByRole('link', { name: 'terms and conditions' })
		expect(link).toBeInTheDocument()
		expect(link).toHaveAttribute('href', '/docs/T&Cs.pdf')
	})

	it('sets the page title', async () => {
		await waitFor(() => expect(document.title).toEqual("Harry's Hot Tubs"))
	})
})
