import { priceToString } from '@utils/stripe'
import { addHours } from 'date-fns'
import { setStorage } from '../helpers/localStorageHelper'

const totalPrice = priceToString(30400)

before(() => {
	setStorage({
		consent: JSON.stringify({
			value: 'true',
			exp: addHours(new Date(), 2).getTime(),
		}),
	})
	cy.visit('/success?id=pi_1J2Y67A1xrCenV8YEw7AhScA')
})

it('renders title', () => {
	cy.contains('Thank you!').should('exist')
})

it('renders the price', () => {
	cy.contains(totalPrice).should('exist')
})

it('links to the home page', () => {
	cy.get('[role="link"][aria-label="home"]')
		.should('exist')
		.should('have.attr', 'href', '/')
})

it('links to social pages', () => {
	cy.get('[role="link"][aria-label="facebook"]')

		.should('exist')
		.should(
			'have.attr',
			'href',
			'https://www.facebook.com/Harrys-Hot-Tubs-107531397505058'
		)

	cy.get('[role="link"][aria-label="instagram"]')

		.should('exist')
		.should('have.attr', 'href', 'https://www.instagram.com/harryshottubs')
})

it('sets the page title', () => {
	cy.title().should('equal', 'Successful Payment')
})
