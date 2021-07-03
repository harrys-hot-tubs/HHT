beforeEach(() => {
	cy.clearCookies()
})

it('redirects to login page for a unauthenticated user', () => {
	cy.visit('/dashboard')
	cy.location('pathname').should('eq', '/login')
})
