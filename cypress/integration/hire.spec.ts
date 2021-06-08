import { bir } from '@fixtures/coordinateFixtures'
import { locations } from '@fixtures/locationFixtures'
import { birmingham } from '@fixtures/postcodeFixtures'
import { failedRangeResponse } from '@fixtures/rangeFixtures'
import { setStorage } from '../helpers/localStorageHelper'

beforeEach(() => {
	setStorage({ consent: 'true' })
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

		cy.intercept(
			'GET',
			`https://api.postcodes.io/postcodes/${testedPostcode}/validate`,
			{
				statusCode: 200,
				body: {
					result: { isValid: true },
				},
			}
		)

		cy.intercept(
			'GET',
			`https://api.postcodes.io/postcodes/${testedPostcode}`,
			{
				statusCode: 200,
				body: {
					result: { latitude: bir.latitude, longitude: bir.longitude },
				},
			}
		)

		cy.intercept('POST', `/api/locations`, {
			statusCode: 200,
			body: {
				inRange: true,
				closest: locations[0],
			},
		})

		cy.get('[aria-label=postcode]')
			.as('postcode-field')
			.type(testedPostcode)
			.should('have.attr', 'value', testedPostcode)
		cy.get('[data-testid="postcode-validate"]').click()
		cy.get('@postcode-field').should('have.class', 'is-valid')
	})

	it('recognises postcodes of the wrong format', async () => {
		const testedPostcode = birmingham

		cy.intercept(
			'GET',
			`https://api.postcodes.io/postcodes/${testedPostcode}/validate`,
			{
				statusCode: 200,
				body: {
					result: { isValid: false },
				},
			}
		)

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

		cy.intercept(
			'GET',
			`https://api.postcodes.io/postcodes/${testedPostcode}/validate`,
			{
				statusCode: 200,
				body: {
					result: { isValid: false },
				},
			}
		)

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

		cy.intercept('POST', `/api/locations`, {
			statusCode: 200,
			body: failedRangeResponse,
		})

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
	//TODO add date picker tests.
	it('lets the user pick dates', () => {})
	it('lets the user change months', () => {})
	it('lets the user type the dates they want', () => {})
	it('notifies the user ', () => {})
})
