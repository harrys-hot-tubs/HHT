import { RefereeOptions } from '@components/CheckoutForm'
import { formData, validCheckoutInformation } from '@fixtures/checkoutFixtures'
import { mixedSizes } from '@fixtures/tubsFixtures'
import { headedRender } from '@helpers/frontendHelper'
import { setStorage } from '@helpers/localStorageHelper'
import { mockUseRouter } from '@helpers/routerHelper'
import { CheckoutInformation, Fallback } from '@hooks/useCheckoutInformation'
import Checkout from '@pages/checkout'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { momentToString, stringToMoment } from '@utils/date'
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
		beforeEach(() => {
			setStorage(formData)
			console.log(`localStorage.__STORE__`, localStorage.__STORE__)
		})

		it('renders first name field', () => {
			const firstName = screen.getByLabelText('first-name')
			expect(firstName).toBeInTheDocument()
		})

		it('renders last name field', () => {
			const lastName = screen.getByLabelText('last-name')
			expect(lastName).toBeInTheDocument()
		})

		it('renders email field', () => {
			const email = screen.getByLabelText('email')
			expect(email).toBeInTheDocument()
		})

		it('renders telephone number field', () => {
			const telephoneNumber = screen.getByLabelText('telephone')
			expect(telephoneNumber).toBeInTheDocument()
		})

		it('renders address line 1 field', () => {
			const addressLine1 = screen.getByLabelText('address1')
			expect(addressLine1).toBeInTheDocument()
		})

		it('renders address line 2 field', () => {
			const addressLine2 = screen.getByLabelText('address2')
			expect(addressLine2).toBeInTheDocument()
		})

		it('renders address line 3 field', () => {
			const addressLine3 = screen.getByLabelText('address3')
			expect(addressLine3).toBeInTheDocument()
		})

		it('renders postcode field', () => {
			const postcode = screen.getByLabelText('postcode')
			expect(postcode).toBeInTheDocument()
			expect(postcode).toHaveAttribute('placeholder', formData.postcode)
			expect(postcode).toHaveAttribute('readonly')
		})

		it('renders referee field', () => {
			const referee = screen.getByLabelText('referee')
			expect(referee).toBeInTheDocument()

			const refereeOptions = screen.getByTestId('referees')
			expect(refereeOptions).toBeInTheDocument()
			expect(refereeOptions.childElementCount).toBe(RefereeOptions.length)
		})

		it('renders requests field', () => {
			const requests = screen.getByLabelText('requests')
			expect(requests).toBeInTheDocument()
		})

		it('renders start date field', () => {
			const storedDate = formData.startDate
			const expectedOutput = momentToString(stringToMoment(storedDate))

			const startDate = screen.getByLabelText('start-date')
			expect(startDate).toBeInTheDocument()
			expect(startDate).toHaveAttribute('placeholder', expectedOutput)
			expect(startDate).toHaveAttribute('disabled')
		})

		it('renders end date field', () => {
			const storedDate = formData.endDate
			const expectedOutput = momentToString(stringToMoment(storedDate))

			const endDate = screen.getByLabelText('end-date')
			expect(endDate).toBeInTheDocument()
			expect(endDate).toHaveAttribute('placeholder', expectedOutput)
			expect(endDate).toHaveAttribute('disabled')
		})

		it('renders only these fields', () => {
			const form = screen.getByRole('main')
			expect(form.getElementsByClassName('form-group').length).toBe(12)
		})

		afterEach(() => {
			localStorage.clear()
		})
	})

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
