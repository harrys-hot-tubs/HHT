import { addHours } from 'date-fns'
import { setStorage } from '../helpers/localStorageHelper'

before(() => {
	setStorage({
		consent: JSON.stringify({
			value: 'true',
			exp: addHours(new Date(), 2).getTime(),
		}),
	})
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
