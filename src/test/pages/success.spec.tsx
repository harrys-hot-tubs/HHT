import { headedRender } from '@helpers/frontendHelper'
import Success from '@pages/success'
import '@testing-library/jest-dom'
import { screen, waitFor } from '@testing-library/react'
import { priceToString } from '@utils/stripe'
import React from 'react'

const totalPrice = priceToString(10900)

beforeEach(() => {
	headedRender(<Success {...{ totalPrice }} />)
})

it('renders title', () => {
	expect(screen.getByText(/thank you!/i)).toBeInTheDocument()
})

it('renders the price', () => {
	expect(screen.getByText(totalPrice, { exact: false })).toBeInTheDocument()
})

it('links to the home page', () => {
	const link = screen.getByRole('link', { name: 'home' })
	expect(link).toBeInTheDocument()
	expect(link).toHaveAttribute('href', '/')
})

it('links to social pages', () => {
	const facebookLink = screen.getByRole('link', { name: 'facebook' })
	expect(facebookLink).toBeInTheDocument()
	expect(facebookLink).toHaveAttribute(
		'href',
		'https://www.facebook.com/Harrys-Hot-Tubs-107531397505058'
	)

	const instagramLink = screen.getByRole('link', { name: 'instagram' })
	expect(instagramLink).toBeInTheDocument()
	expect(instagramLink).toHaveAttribute(
		'href',
		'https://www.instagram.com/harryshottubs'
	)
})

it('sets the page title', async () => {
	await waitFor(() => expect(document.title).toEqual('Successful Payment'))
})
