import { setStorage } from '../helpers/localStorageHelper'

before(() => {
	setStorage({ consent: 'true' })
	cy.visit('/failure')
})

it('renders heading', () => {
	cy.contains('Oh no!').should('exist')
})

it('links to the home page', () => {
	cy.get('[role=link]').should('exist').should('have.attr', 'href', '/')
})

it('sets the page title', () => {
	cy.title().should('equal', 'Payment Unsuccessful')
})
