import { formData, validCheckoutInformation } from '@fixtures/checkoutFixtures'
import { mixedSizes } from '@fixtures/tubsFixtures'
import { headedRender } from '@helpers/frontendHelper'
import { setStorage } from '@helpers/localStorageHelper'
import { mockUseRouter } from '@helpers/routerHelper'
import { CheckoutInformation, Fallback } from '@hooks/useCheckoutInformation'
import Checkout from '@pages/checkout'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'

const actions = mockUseRouter({})

describe('checkout page', () => {
	beforeEach(() => {
		headedRender(<Checkout tubID={mixedSizes[0].tub_id} />)
	})

	it('sets the page title', async () => {
		await waitFor(() => expect(document.title).toEqual('Checkout'))
	})

	it('redirects to hire if data is not present', () => {
		render(<Checkout tubID={mixedSizes[0].tub_id} />)
		expect(actions.push).toBeCalledWith('/hire')
	})

	describe('rendering', () => {
		describe('data entry', () => {
			beforeEach(() => {
				setStorage(formData)
			})

			it('takes in data from the first name field', () => {
				const { firstName } = validCheckoutInformation
				const firstNameField = screen.getByLabelText('first-name')

				userEvent.type(firstNameField, firstName)
				expect(localStorage.setItem).toHaveBeenLastCalledWith(
					'checkoutInformation',
					JSON.stringify({
						...Fallback,
						firstName,
					} as CheckoutInformation)
				)
			})

			it('takes in data from the last name field', () => {
				const { lastName } = validCheckoutInformation
				const lastNameField = screen.getByLabelText('last-name')

				userEvent.type(lastNameField, lastName)
				expect(localStorage.setItem).toHaveBeenLastCalledWith(
					'checkoutInformation',
					JSON.stringify({
						...Fallback,
						lastName,
					} as CheckoutInformation)
				)
			})

			it('takes in data from the email field', () => {
				const { email } = validCheckoutInformation
				const emailField = screen.getByLabelText('email')

				userEvent.type(emailField, email)
				expect(localStorage.setItem).toHaveBeenLastCalledWith(
					'checkoutInformation',
					JSON.stringify({
						...Fallback,
						email,
					} as CheckoutInformation)
				)
			})

			it('takes in data from the telephone number field', () => {
				const { telephoneNumber } = validCheckoutInformation
				const telephoneNumberField = screen.getByLabelText('telephone')

				userEvent.type(telephoneNumberField, telephoneNumber)
				expect(localStorage.setItem).toHaveBeenLastCalledWith(
					'checkoutInformation',
					JSON.stringify({
						...Fallback,
						telephoneNumber,
					} as CheckoutInformation)
				)
			})

			it('takes in data from the address line 1 field', () => {
				const { addressLine1 } = validCheckoutInformation
				const addressLine1Field = screen.getByLabelText('address1')

				userEvent.type(addressLine1Field, addressLine1)
				expect(localStorage.setItem).toHaveBeenLastCalledWith(
					'checkoutInformation',
					JSON.stringify({
						...Fallback,
						addressLine1,
					} as CheckoutInformation)
				)
			})

			it('takes in data from the address line 2 field', () => {
				const { addressLine2 } = validCheckoutInformation
				const addressLine2Field = screen.getByLabelText('address2')

				userEvent.type(addressLine2Field, addressLine2)
				expect(localStorage.setItem).toHaveBeenLastCalledWith(
					'checkoutInformation',
					JSON.stringify({
						...Fallback,
						addressLine2,
					} as CheckoutInformation)
				)
			})

			it('takes in data from the address line 3 field', () => {
				const { addressLine3 } = validCheckoutInformation
				const addressLine3Field = screen.getByLabelText('address3')

				userEvent.type(addressLine3Field, addressLine3)
				expect(localStorage.setItem).toHaveBeenLastCalledWith(
					'checkoutInformation',
					JSON.stringify({
						...Fallback,
						addressLine3,
					} as CheckoutInformation)
				)
			})

			it('takes in data from the referee field', () => {
				const { referee } = validCheckoutInformation
				const refereeField = screen.getByLabelText('referee')

				userEvent.type(refereeField, referee)
				expect(localStorage.setItem).toHaveBeenLastCalledWith(
					'checkoutInformation',
					JSON.stringify({
						...Fallback,
						referee,
					} as CheckoutInformation)
				)
			})

			it('takes in data from the requests field', () => {
				const { specialRequests } = validCheckoutInformation
				const requestsField = screen.getByLabelText('requests')

				userEvent.type(requestsField, specialRequests)
				expect(localStorage.setItem).toHaveBeenLastCalledWith(
					'checkoutInformation',
					JSON.stringify({
						...Fallback,
						specialRequests,
					} as CheckoutInformation)
				)
			})

			it('indicates invalid fields on the form', () => {
				const submit = screen.getByText(/submit/i)
				expect(submit).toBeInTheDocument()
				userEvent.click(submit)

				const invalidMessages = screen.getAllByRole('alert')
				expect(invalidMessages.length).toBeLessThanOrEqual(12)
				expect(invalidMessages.length).toBe(8)
				invalidMessages.forEach((message) => {
					expect(message).toHaveStyle({ display: 'block' })
					expect(message).not.toHaveStyle({ display: 'none' })
				})
			})

			afterEach(() => {
				localStorage.clear()
			})
		})
	})
})
