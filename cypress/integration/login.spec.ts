import { setStorage } from '../helpers/localStorageHelper'

beforeEach(() => {
	setStorage({ consent: 'true' })
	cy.visit('/login')
})

it('sets the page title', () => {
	cy.title().should('eq', 'Login')
})

describe('form', () => {
	describe('email address field', () => {
		it('exists', () => {
			cy.get('[aria-label=email]').should('exist')
		})

		it('has the correct autocomplete attribute', () => {
			cy.get('[aria-label=email]').should('have.attr', 'autocomplete', 'email')
		})
	})

	describe('password field', () => {
		it('exists', () => {
			cy.get('[aria-label=password]').should('exist')
		})

		it('has the correct autocomplete attribute', () => {
			cy.get('[aria-label=password]').should(
				'have.attr',
				'autocomplete',
				'current-password'
			)
		})
	})

	it('has a submit button', () => {
		cy.get('[data-testid=submit').should('exist')
	})

	it('allows the user to login', () => {
		cy.get('[aria-label=email]').type('test')
		cy.get('[aria-label=password]').type('test')

		cy.get('[data-testid=submit]').click()
		cy.location('pathname').should('eq', '/secure')
	})
})
