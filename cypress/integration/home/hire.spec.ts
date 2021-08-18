import { bir } from '@fixtures/coordinateFixtures'
import { locations } from '@fixtures/locationFixtures'
import { birmingham } from '@fixtures/postcodeFixtures'
import { failedRangeResponse } from '@fixtures/rangeFixtures'
import { addHours, addMonths, format, isSameDay } from 'date-fns'
import { setStorage } from '../../helpers/localStorageHelper'

const date = new Date('2021-07-05')

beforeEach(() => {
	setStorage({
		consent: JSON.stringify({
			value: 'true',
			exp: addHours(new Date(), 2).getTime(),
		}),
	})

	cy.clock(date) // Avoid problem of testing on weekends.
	cy.visit('/#book')
	cy.tick(1000)
})

it('renders heading', () => {
	cy.get('section#book > h2').should('contain.text', 'Hire a Tub')
})

it('sets the page title', () => {
	cy.title().should('eq', 'Hire a Hot Tub')
})

describe('postcode field', () => {
	it('renders field', () => {
		cy.get('[aria-label=postcode]').should('exist')
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
		}).as('validatePostcode')

		cy.get('[aria-label=postcode]')
			.as('postcode-field')
			.type(testedPostcode)
			.should('have.attr', 'value', testedPostcode)

		cy.tick(1000)

		cy.wait('@validatePostcode')

		cy.get('@postcode-field').should('have.class', 'is-valid')
	})

	it('recognises postcodes of the wrong format', () => {
		const testedPostcode = 'BCC67 2DD'

		cy.get('[aria-label=postcode]')
			.type(testedPostcode)
			.should('have.attr', 'value', testedPostcode)
		cy.tick(1000)

		cy.get('[role=alert]')
			.should('be.visible')
			.should('have.text', 'Postcode is not in the correct format.')
	})

	it('recognises postcodes that are blocked', () => {
		const testedPostcode = 'SE1 1AP'

		cy.get('[aria-label=postcode]')
			.type(testedPostcode)
			.should('have.attr', 'value', testedPostcode)

		cy.tick(1000)

		cy.get('[role=alert]')
			.should('be.visible')
			.should('contain.text', 'Delivery in your area is subject to change.')
	})

	it('recognises postcodes that are out of range', () => {
		const testedPostcode = birmingham

		cy.intercept('POST', `/api/locations`, {
			statusCode: 200,
			body: failedRangeResponse,
		}).as('validatePostcode')

		cy.get('[aria-label=postcode]')
			.type(testedPostcode)
			.should('have.attr', 'value', testedPostcode)
		cy.tick(1000)

		cy.wait('@validatePostcode')

		cy.get('[role=alert]')
			.should('be.visible')
			.contains("Sadly we don't currently offer deliveries in your area.")
	})
})

describe('date picker', () => {
	it('lets the user pick dates', () => {
		cy.get('.inline-picker.hire#start').as('startDate').click()
		cy.get('div.react-datepicker__today-button').click()
		cy.get('@startDate').contains(date.toLocaleDateString('en-GB'))

		cy.getLocalStorage('startDate').then((startDate) => {
			expect(isSameDay(new Date(startDate), date)).to.be.true
		})
	})

	it('lets the user change months', () => {
		cy.get('.inline-picker.hire#start').as('startDate').click()
		cy.get('div.react-datepicker__today-button').click()
		cy.get('@startDate').click()
		cy.get('.react-datepicker__current-month').should(
			'contain.text',
			format(date, 'MMMM')
		)
		cy.get('[aria-label="Next Month"]').click()
		cy.get('.react-datepicker__current-month').should(
			'contain.text',
			format(addMonths(date, 1), 'MMMM')
		)

		cy.get('@startDate').contains(date.toLocaleDateString('en-GB'))
	})
})
