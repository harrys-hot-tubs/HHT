import { bir } from '@fixtures/coordinateFixtures'
import { locations } from '@fixtures/locationFixtures'
import { birmingham, failedRangeResponse } from '@fixtures/postcodeFixtures'
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'

const mock = new MockAdapter(axios)

beforeEach(() => {
	cy.visit('/hire')
})

it('renders heading', () => {
	cy.get('[role=heading]').should('exist').should('have.text', 'Hire a hot tub')
})

it('sets the page title', () => {
	cy.title().should('eq', 'Hire a Hot Tub')
})

describe('postcode field', () => {
	it('renders all parts', () => {
		cy.get('[aria-label=postcode]').should('exist')
		cy.get('[data-testid="postcode-validate"]').should('exist')
	})

	it('recognises valid postcode', () => {
		const testedPostcode = birmingham

		mock
			.onGet(`https://api.postcodes.io/postcodes/${testedPostcode}/validate`)
			.reply(200, {
				result: { isValid: true },
			})
		mock
			.onGet(`https://api.postcodes.io/postcodes/${testedPostcode}`)
			.reply(200, {
				result: { latitude: bir.latitude, longitude: bir.longitude },
			})
		mock.onPost(`/api/locations`).reply(200, {
			inRange: true,
			closest: locations[0],
		})

		cy.get('[aria-label=postcode]')
			.type(testedPostcode)
			.should('have.attr', 'value', testedPostcode)
		cy.get('[data-testid="postcode-validate"]').click()
		cy.get('[role=alert]').should('not.be.visible')
	})

	it('recognises postcodes of the wrong format', async () => {
		const testedPostcode = birmingham

		mock
			.onGet(`https://api.postcodes.io/postcodes/${testedPostcode}/validate`)
			.reply(200, {
				result: { isValid: false },
			})

		cy.get('[aria-label=postcode]')
			.type(testedPostcode)
			.should('have.attr', 'value', testedPostcode)
		cy.get('[data-testid="postcode-validate]').click()

		cy.get('[role=alert]')
			.should('be.visible')
			.should('have.text', 'Postcode is not in the correct format.')
	})

	it('recognises postcodes that are blocked', async () => {
		const testedPostcode = 'SE1 1AP'

		mock
			.onGet(`https://api.postcodes.io/postcodes/${testedPostcode}/validate`)
			.reply(200, {
				result: { isValid: false },
			})

		cy.get('[aria-label=postcode]')
			.type(testedPostcode)
			.should('have.attr', 'value', testedPostcode)
		cy.get('[data-testid="postcode-validate]').click()

		cy.get('[role=alert]')
			.should('be.visible')
			.should('have.text', 'Delivery in your area is subject to change.')
	})

	it('recognises postcodes that are out of range', async () => {
		const testedPostcode = birmingham

		mock.onPost('/api/locations').reply(200, failedRangeResponse)

		cy.get('[aria-label=postcode]')
			.type(testedPostcode)
			.should('have.attr', 'value', testedPostcode)
		cy.get('[data-testid="postcode-validate]').click()

		cy.get('[role=alert]')
			.should('be.visible')
			.should(
				'have.text',
				"Sadly we don't currently offer deliveries in your area."
			)
	})
})

describe('date picker', () => {
	it('lets the user pick dates', () => {
		cy.get('.DayPickerNavigation_rightButton__horizontalDefault').click()
	})
	it('lets the user change months', () => {})
	it('lets the user type the dates they want', () => {})
	it('notifies the user ', () => {})
})
