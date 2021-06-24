import { addHours } from 'date-fns'
import accounts from '../fixtures/accounts.json'
import { setStorage } from '../helpers/localStorageHelper'

before(() => {
	cy.task('addAccounts')
})

beforeEach(() => {
	cy.clearLocalStorage()
	setStorage({
		consent: JSON.stringify({
			value: 'true',
			exp: addHours(new Date(), 2).getTime(),
		}),
	})
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
		cy.get('[aria-label=email]').type(accounts[0].email_address)
		cy.get('[aria-label=password]').type('password')

		cy.get('[data-testid=submit]').click()
		cy.location('pathname').should('eq', '/dashboard')
	})
})

it('redirects authenticated users to the dashboard', () => {
	cy.task('generateToken', { index: 1 }).then((token: string) =>
		cy.setCookie('token', token)
	)
	cy.reload()
	cy.url().should('eq', Cypress.config().baseUrl + '/dashboard')
})

it('shows the user an error if their credentials are invalid', () => {
	cy.get('[aria-label=email]').type(accounts[0].email_address)
	cy.get('[aria-label=password]').type('zxcvbn')
	cy.get('[data-testid=submit]').click()

	cy.get('[data-testid=alert-message]').should('be.visible')
})

after(() => {
	cy.task('cleanup')
})
