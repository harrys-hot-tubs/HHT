const BUTTON_INDEX = 0
const SLOPPY_CLICK_THRESHOLD = 10

// Based on this answer: https://github.com/cypress-io/cypress/issues/3942#issuecomment-485648100
export default function drag(dragSelector: string, dropSelector: string) {
	Cypress.log({
		name: 'Drag And Drop',
		message: `Dragging element ${dragSelector} to ${dropSelector}`,
		consoleProps: () => {
			return {
				subject: dragSelector,
				target: dropSelector,
			}
		},
	})

	cy.get(dragSelector).should('exist').get(dragSelector).should('exist')

	cy.get(dropSelector)
		.first()
		.then(($target) => {
			const coordsDrop = $target[0].getBoundingClientRect()
			cy.get(dragSelector)
				.first()
				.then(($subject) => {
					const coordsDrag = $subject[0].getBoundingClientRect()
					cy.wrap($subject)
						.trigger('mousedown', {
							button: BUTTON_INDEX,
							clientX: coordsDrag.x,
							clientY: coordsDrag.y,
							force: true,
						})
						.trigger('mousemove', {
							button: BUTTON_INDEX,
							clientX: coordsDrag.x + SLOPPY_CLICK_THRESHOLD,
							clientY: coordsDrag.y,
							force: true,
						})

					cy.get('body')
						.trigger('mousemove', {
							button: BUTTON_INDEX,
							clientX: coordsDrop.x + 30,
							clientY: coordsDrop.y + 60,
							force: true,
						})
						.trigger('mouseup')
				})
		})

	return cy.get(dropSelector)
}
