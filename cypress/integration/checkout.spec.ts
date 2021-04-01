import { RefereeOptions } from '@components/CheckoutForm'
import { formData } from '@fixtures/checkoutFixtures'
import { setStorage } from '@helpers/localStorageHelper'
import { displayableMoment, stringToMoment } from '@utils/date'

beforeEach(() => {
	setStorage({ consent: 'true' })
	setStorage(formData)
	cy.visit('/checkout?tub_id=91')
})

it('sets the page title', () => {
	cy.title().should('eq', 'Checkout')
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
		const expectedOutput = displayableMoment(stringToMoment(storedDate))

		cy.get('[aria-label=start-date]')

			.should('exist')
			.should('have.attr', 'placeholder', expectedOutput)
			.should('have.attr', 'disabled')
	})

	it('renders end date field', () => {
		const storedDate = formData.endDate
		const expectedOutput = displayableMoment(stringToMoment(storedDate))

		cy.get('[aria-label=end-date]')

			.should('exist')
			.should('have.attr', 'placeholder', expectedOutput)
			.should('have.attr', 'disabled')
	})

	it('renders only these fields', () => {
		cy.get('.form-group').should('have.length', 12)
	})
})

afterEach(() => {
	cy.clearLocalStorage()
})
