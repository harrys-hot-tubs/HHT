import 'cypress-localstorage-commands'
import drag from './drag'

declare global {
	namespace Cypress {
		interface Chainable {
			drag: (dragSelector: string, dropSelector: string) => Chainable
		}
	}
}

Cypress.Commands.add('drag', drag)
