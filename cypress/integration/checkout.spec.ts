import { RefereeOptions } from '@components/CheckoutForm'
import { formData, validCheckoutInformation } from '@fixtures/checkoutFixtures'
import { setStorage } from '@helpers/localStorageHelper'
import { CheckoutInformation, Fallback } from '@hooks/useCheckoutInformation'

beforeEach(() => {
	setStorage({ consent: 'true' })
	setStorage(formData)
	cy.visit('/checkout?tub_id=91')
})

it('sets the page title', () => {
	cy.title().should('eq', 'Checkout')
})

it('redirects to hire if data is not present', () => {
	cy.clearLocalStorage()
	cy.visit('/checkout')
	cy.location('pathname').should('eq', '/hire')
})

describe('rendering', () => {
	it('renders first name field', () => {
		cy.get('[aria-label=first-name]').should('exist')
	})

	it('renders last name field', () => {
		cy.get('[aria-label=last-name]').should('exist')
	})

	it('renders email field', () => {
		cy.get('[aria-label=email]').should('exist')
	})

	it('renders telephone number field', () => {
		cy.get('[aria-label=telephone]').should('exist')
	})

	it('renders address line 1 field', () => {
		cy.get('[aria-label=address1]').should('exist')
	})

	it('renders address line 2 field', () => {
		cy.get('[aria-label=address2]').should('exist')
	})

	it('renders address line 3 field', () => {
		cy.get('[aria-label=address3]').should('exist')
	})

	it('renders postcode field', () => {
		cy.get('[aria-label=postcode]')

			.should('exist')
			.should('have.attr', 'placeholder', formData.postcode)
			.should('have.attr', 'readonly')
	})

	it('renders referee field', () => {
		cy.get('[aria-label=referee]').should('exist')

		cy.get('[data-testid=referees]')
			.should('exist')
			.children()
			.should('have.length', RefereeOptions.length)
	})

	it('renders requests field', () => {
		cy.get('[aria-label=requests]').should('exist')
	})

	it('renders start date field', () => {
		const storedDate = formData.startDate
		const expectedOutput = new Date(storedDate).toLocaleDateString()

		cy.get('[aria-label=start-date]')

			.should('exist')
			.should('have.attr', 'placeholder', expectedOutput)
			.should('have.attr', 'disabled')
	})

	it('renders end date field', () => {
		const storedDate = formData.endDate
		const expectedOutput = new Date(storedDate).toLocaleDateString()

		cy.get('[aria-label=end-date]')

			.should('exist')
			.should('have.attr', 'placeholder', expectedOutput)
			.should('have.attr', 'disabled')
	})

	it('renders only these fields', () => {
		cy.get('.form-group').should('have.length', 12)
	})
})

describe('data entry', () => {
	beforeEach(() => {
		setStorage(formData)
	})

	it('takes in data from the first name field', () => {
		const { firstName } = validCheckoutInformation
		cy.get('[aria-label=first-name]').type(firstName)
		cy.getLocalStorage('checkoutInformation').should(
			'eq',
			JSON.stringify({
				...Fallback,
				firstName,
			} as CheckoutInformation)
		)
	})

	it('takes in data from the last name field', () => {
		const { lastName } = validCheckoutInformation
		cy.get('[aria-label=last-name]').type(lastName)
		cy.getLocalStorage('checkoutInformation').should(
			'eq',
			JSON.stringify({
				...Fallback,
				lastName,
			} as CheckoutInformation)
		)
	})

	it('takes in data from the email field', () => {
		const { email } = validCheckoutInformation
		cy.get('[aria-label=email]').type(email)
		cy.getLocalStorage('checkoutInformation').should(
			'eq',
			JSON.stringify({
				...Fallback,
				email,
			} as CheckoutInformation)
		)
	})

	it('takes in data from the telephone number field', () => {
		const { telephoneNumber } = validCheckoutInformation
		cy.get('[aria-label=telephone]').type(telephoneNumber)
		cy.getLocalStorage('checkoutInformation').should(
			'eq',
			JSON.stringify({
				...Fallback,
				telephoneNumber,
			} as CheckoutInformation)
		)
	})

	it('takes in data from the address line 1 field', () => {
		const { addressLine1 } = validCheckoutInformation
		cy.get('[aria-label=address1]').type(addressLine1)
		cy.getLocalStorage('checkoutInformation').should(
			'eq',
			JSON.stringify({
				...Fallback,
				addressLine1,
			} as CheckoutInformation)
		)
	})

	it('takes in data from the address line 2 field', () => {
		const { addressLine2 } = validCheckoutInformation
		cy.get('[aria-label=address2]').type(addressLine2)
		cy.getLocalStorage('checkoutInformation').should(
			'eq',
			JSON.stringify({
				...Fallback,
				addressLine2,
			} as CheckoutInformation)
		)
	})

	it('takes in data from the address line 3 field', () => {
		const { addressLine3 } = validCheckoutInformation
		cy.get('[aria-label=address3]').type(addressLine3)
		cy.getLocalStorage('checkoutInformation').should(
			'eq',
			JSON.stringify({
				...Fallback,
				addressLine3,
			} as CheckoutInformation)
		)
	})

	it('takes in data from the referee field', () => {
		const { referee } = validCheckoutInformation
		cy.get('[aria-label=referee]').type(referee)
		cy.getLocalStorage('checkoutInformation').should(
			'eq',
			JSON.stringify({
				...Fallback,
				referee,
			} as CheckoutInformation)
		)
	})

	it('takes in data from the requests field', () => {
		const { specialRequests } = validCheckoutInformation
		cy.get('[aria-label=requests]').type(specialRequests)
		cy.getLocalStorage('checkoutInformation').should(
			'eq',
			JSON.stringify({
				...Fallback,
				specialRequests,
			} as CheckoutInformation)
		)
	})

	it('indicates invalid fields on the form', () => {
		cy.get('.checkout-button').click()
		cy.get('[role=alert]')
			.should('have.length.within', 8, 12)
			.each((message) => {
				expect(message).to.have.css('display', 'block')
				expect(message).not.to.have.css('display', 'none')
			})
	})
})

afterEach(() => {
	cy.clearLocalStorage()
})
