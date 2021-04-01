import { priceToString } from '@utils/stripe'

const totalPrice = priceToString(17900)

//TODO convert to cypress

before(() => {
	cy.visit(
		'/success?session_id=cs_test_b1ntF5EK43fzumB9QUrkhvof77a5DH6eOUgHsrypgdQ24o5xUz9LahsmWF'
	)
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
