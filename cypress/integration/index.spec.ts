before(() => {
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
	const link = cy.get('a[aria-label="FAQs"]')

	link.should('exist').should('have.attr', 'href', '/docs/FAQs.pdf')
})

it('links to terms and conditions', () => {
	const link = cy.get('a[aria-label="terms and conditions"]')

	link.should('exist').should('have.attr', 'href', '/docs/T&Cs.pdf')
})

it('sets the page title', () => {
	cy.title().should('equal', "Harry's Hot Tubs")
})