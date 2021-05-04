import { headedRender } from '@helpers/frontendHelper'
import { mockUseRouter } from '@helpers/routerHelper'
import Index from '@pages/index'
import '@testing-library/jest-dom'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'

const actions = mockUseRouter({})

beforeEach(() => {
	headedRender(<Index />)
})

it('prefetches hire page', () => {
	const title = screen.getByRole('heading', { level: 1 })
	expect(title).toBeInTheDocument()
	expect(title.textContent).toEqual("Harry's Hot Tubs")
})

it('links to hire page', async () => {
	const link = screen.getByRole('link', { name: 'hire' })
	expect(link).toBeInTheDocument()
	expect(link.textContent).toEqual('Hire a Hot Tub')

	userEvent.click(link)
	expect(actions.push).toHaveBeenCalledWith('/hire')
})
