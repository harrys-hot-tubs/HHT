import { ValueWithExpiration } from '../../src/hooks/useStoredStateWithExpiration'
import { setStorage } from '../helpers/localStorageHelper'

before(() => {
	setStorage({ consent: 'true' })
	cy.visit('/')
})

it('renders heading properly', () => {
	cy.get('[role=heading]').should('contain.text', "Harry's Hot Tubs")
})

it('renders call to action button properly', () => {
	cy.get('[aria-label=hire]')

		.should('contain.text', 'Hire a Hot Tub')
		.should('not.have.css', 'background-color', '$primary-pink')
})

it('links to privacy policy', () => {
	cy.get('a[aria-label="privacy policy"]')
		.should('exist')
		.should('have.attr', 'href', '/docs/Privacy Policy.pdf')
})

it('links to FAQs', () => {
	cy.get('a[aria-label="FAQs"]')
		.should('exist')
		.should('have.attr', 'href', '/docs/FAQs.pdf')
})

it('links to terms and conditions', () => {
	cy.get('a[aria-label="terms and conditions"]')
		.should('exist')
		.should('have.attr', 'href', '/docs/T&Cs.pdf')
})

it('sets the page title', () => {
	cy.title().should('equal', "Harry's Hot Tubs")
})

describe('tracking', () => {
	beforeEach(() => {
		cy.clearLocalStorage()
		cy.visit('/')
	})

	it('displays the consent modal when no consent value is stored', () => {
		cy.get('.modal-dialog').should('exist')
		cy.get('.modal-title').should('have.text', 'This website uses cookies')
		cy.get('button').contains('Accept').should('exist')
		cy.get('button').contains('Reject').should('exist')
	})

	it('does not display the consent modal when consent is already provided', () => {
		setStorage({
			consent: JSON.stringify({
				value: 'true',
				exp: Date.now() + 3600 * 1000,
			} as ValueWithExpiration),
		})
		cy.reload()
		cy.get('.modal-dialog').should('not.exist')
	})

	it('does not display the consent modal when consent is not provided', () => {
		setStorage({
			consent: JSON.stringify({
				value: 'false',
				exp: Date.now() + 3600 * 1000,
			} as ValueWithExpiration),
		})
		cy.reload()
		cy.get('.modal-dialog').should('exist')
	})

	it('displays the consent modal if consent has expired', () => {
		setStorage({
			consent: JSON.stringify({
				value: 'true',
				exp: Date.now() - 3600 * 1000,
			} as ValueWithExpiration),
		})
		cy.reload()
		cy.get('.modal-dialog').should('exist')
	})
})
