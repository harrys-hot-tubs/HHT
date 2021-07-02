import { addHours } from 'date-fns'
import accounts from '../fixtures/accounts.json'

const loadPage = () => {
	cy.setLocalStorage(
		'consent',
		JSON.stringify({
			value: 'true',
			exp: addHours(new Date(), 2).getTime(),
		})
	)
	cy.visit('/login')
}

before(() => {
	cy.task('addAccounts')
})

it('sets the page title', () => {
	loadPage()

	cy.title().should('eq', 'Login')
})

describe('form', () => {
	before(() => loadPage())

	describe('email address field', () => {
		before(() => {
			cy.clearCookies()
			loadPage()
		})

		it('exists', () => {
			cy.get('[aria-label=email]').should('exist')
		})

		it('has the correct autocomplete attribute', () => {
			cy.get('[aria-label=email]').should('have.attr', 'autocomplete', 'email')
		})
	})

	describe('password field', () => {
		before(() => {
			cy.clearCookies()
			loadPage()
		})

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
		cy.intercept('POST', '/api/auth').as('login')

		cy.get('[aria-label=email]').type(accounts[0].email_address)
		cy.get('[aria-label=password]').type('password')

		cy.get('[data-testid=submit]').click()
		cy.wait('@login')

		cy.location('pathname').should('eq', '/dashboard')
	})
})

it('redirects authenticated users to the dashboard', () => {
	cy.task('generateToken', { index: 1 }).then((token: string) =>
		cy.setCookie('token', token)
	)
	loadPage()

	cy.url().should('eq', Cypress.config().baseUrl + '/dashboard')
})

it('shows the user an error if their credentials are invalid', () => {
	cy.intercept('POST', '/api/auth').as('login')
	loadPage()

	cy.get('[aria-label=email]').type(accounts[0].email_address)
	cy.get('[aria-label=password]').type('zxcvbn')
	cy.get('[data-testid=submit]').click()

	cy.wait('@login')

	cy.get('[data-testid=alert-message]').should('be.visible')
})

after(() => {
	cy.task('cleanup')
})
