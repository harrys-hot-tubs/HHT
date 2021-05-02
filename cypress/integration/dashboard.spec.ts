import {
	bookings,
	generateEndDate,
	generateStartDate,
} from '@fixtures/bookingFixtures'
import { locations } from '@fixtures/locationFixtures'
import { storedOrder } from '@fixtures/orderFixtures'
import { mixedSizes } from '@fixtures/tubsFixtures'
import { extractBookingStart } from '@utils/date'
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import accounts from '../fixtures/accounts.json'
import { setStorage } from '../helpers/localStorageHelper'

const mock = new MockAdapter(axios)

before(() => {
	cy.task('addAccounts')
	cy.task('DBInsert', { tableName: 'locations', data: locations })
	cy.task('DBInsert', {
		tableName: 'staff',
		data: [
			{
				account_id: accounts[1].account_id,
				location_id: locations[0].location_id,
			},
		],
	})
	cy.task('DBInsert', { tableName: 'tubs', data: mixedSizes })
	cy.task('DBInsert', { tableName: 'bookings', data: [bookings[0]] })
	cy.task('DBInsert', { tableName: 'orders', data: [storedOrder] })
})

beforeEach(() => {
	cy.clearCookies()
})

it('redirects to login page for a unauthenticated user', () => {
	cy.visit('/dashboard')
	cy.url().should('eq', Cypress.config().baseUrl + '/login')
})

describe("manager's dashboard", () => {
	beforeEach(() => {
		cy.clearLocalStorage()
		setStorage({ consent: 'true' })
		cy.task('generateToken', { index: 0 }).then((token: string) =>
			cy.setCookie('token', token)
		)
		cy.visit('/dashboard')
	})

	it('sets the page title', () => {
		cy.title().should('equal', 'Dashboard')
	})

	it('displays loading to the user whilst loading', () => {
		cy.get('[data-testid=loading-indicator]').should('exist')
	})

	it('displays a list of upcoming orders', () => {
		cy.get(`[data-testid=${storedOrder.id}]`).should('exist')
	})

	it('displays information about the order', () => {
		cy.get(`[data-testid=booking_id]`)
			.should('exist')
			.should('have.text', bookings[0].booking_id)
		cy.get(`[data-testid=payment_intent_id]`).should('exist')
		cy.get(`[data-testid=paid]`)
			.should('exist')
			.should('have.text', storedOrder.paid.toString())
		cy.get(`[data-testid=fulfilled]`)
			.should('exist')
			.should('have.text', storedOrder.fulfilled.toString())
		cy.get(`[data-testid=full_name]`)
			.should('exist')
			.should('have.text', storedOrder.first_name + ' ' + storedOrder.last_name)
		cy.get(`[data-testid=email_address]`)
			.should('exist')
			.should('have.text', storedOrder.email)
		cy.get(`[data-testid=booking_start]`).should('exist')
	})
})

describe("driver's dashboard", () => {
	beforeEach(() => {
		cy.clearLocalStorage()
		setStorage({ consent: 'true' })
		cy.task('generateToken', { index: 1 }).then((token: string) =>
			cy.setCookie('token', token)
		)
		cy.visit('/dashboard')
	})

	it('sets the page title', () => {
		cy.title().should('equal', 'Dashboard')
	})

	it("displays a title indicating the driver's region", () => {
		cy.get('h1').should('have.text', `Orders in ${locations[0].name}`)
	})

	it('display a card for each upcoming order', () => {
		setStorage({ minDate: generateStartDate(), maxDate: generateEndDate() })
		cy.reload()

		cy.get('.order-card').should('be.visible').as('card')
		cy.get('@card')
			.find('h5')
			.should('have.text', storedOrder.first_name + ' ' + storedOrder.last_name)
		cy.get('@card').click()
		cy.get('@card')
			.find('.order-address')
			.should('contain.text', storedOrder.address_line_1)
			.should('contain.text', storedOrder.address_line_2)
			.should('contain.text', storedOrder.address_line_3)
			.should('contain.text', storedOrder.postcode)
		cy.get('@card')
			.find('small')
			.should(
				'contain.text',
				`Delivery ${extractBookingStart(
					bookings[0].booking_duration
				).toLocaleDateString()}`
			)
	})

	it('allows cards to be dragged from one column to another', () => {
		mock.onPost(`/api/orders/${storedOrder.id}`).replyOnce(200)
		setStorage({ minDate: generateStartDate(), maxDate: generateEndDate() })
		cy.reload()

		cy.get('.order-card').should('be.visible')
		cy.drag('.order-card', '[data-testid=delivered]').should(
			'contain',
			storedOrder.first_name + ' ' + storedOrder.last_name
		)
	})

	describe('cards are shown when their date is in range', () => {
		beforeEach(() => {
			cy.task('DBClear', { tableName: 'fulfilments' })
			cy.task('DBClear', { tableName: 'orders' })
			setStorage({ minDate: '1901-01-01', maxDate: '1901-01-06' })
		})

		it('displays in date upcoming deliveries', () => {
			cy.task('DBInsert', { tableName: 'orders', data: [storedOrder] })

			cy.get('.order-card').should('not.exist')
			setStorage({ minDate: generateStartDate(), maxDate: generateStartDate() })
			cy.reload()
			cy.get('.order-card')
				.should('be.visible')
				.parent()
				.should('have.attr', 'data-rbd-droppable-id', 'upcoming')
		})

		it('displays in date delivered orders', () => {
			cy.task('DBInsert', {
				tableName: 'orders',
				data: [{ ...storedOrder, fulfilled: true }],
			})

			cy.get('.order-card').should('not.exist')
			setStorage({ minDate: generateEndDate(), maxDate: generateEndDate() })
			cy.reload()
			cy.get('.order-card')
				.should('be.visible')
				.parent()
				.should('have.attr', 'data-rbd-droppable-id', 'delivered')
		})

		it('displays in date returned orders', () => {
			cy.task('DBInsert', {
				tableName: 'orders',
				data: [{ ...storedOrder, fulfilled: true, returned: true }],
			})

			cy.get('.order-card').should('not.exist')
			setStorage({ minDate: generateStartDate(), maxDate: generateEndDate() })
			cy.reload()
			cy.get('.order-card')
				.should('be.visible')
				.parent()
				.should('have.attr', 'data-rbd-droppable-id', 'returned')
		})
	})

	describe('calendar interaction', () => {
		it('allows the start date to be set', () => {
			cy.get('input#start').as('startDate').click()
			cy.get('div.react-datepicker__today-button').click()
			cy.get('@startDate').should(
				'have.attr',
				'value',
				new Date().toLocaleDateString('en-GB')
			)

			cy.getLocalStorage('minDate').then((minDate) => {
				expect(minDate).to.contain(new Date().toISOString().substr(0, 10))
			})
		})

		it('allows the end date to be set', () => {
			cy.get('input#end').as('endDate').click()
			cy.get('div.react-datepicker__today-button').click()
			cy.get('@endDate').should(
				'have.attr',
				'value',
				new Date().toLocaleDateString('en-GB')
			)

			cy.getLocalStorage('maxDate').then((maxDate) => {
				expect(maxDate).to.contain(new Date().toISOString().substr(0, 10))
			})
		})

		it('persists dates between reloads', () => {
			setStorage({ minDate: generateStartDate() })
			cy.get('input#start').as('startDate').click()
			cy.get('div.react-datepicker__today-button').click()

			cy.get('@startDate').should(
				'have.attr',
				'value',
				new Date().toLocaleDateString('en-GB')
			)
			cy.reload()
			cy.get('@startDate').should(
				'have.attr',
				'value',
				new Date().toLocaleDateString('en-GB')
			)
		})

		it('swaps dates of incorrect order', () => {
			setStorage({ maxDate: generateEndDate() })
			cy.get('input#end').click()
			cy.get('div.react-datepicker__today-button').click()
			cy.get('input#start').should(
				'have.attr',
				'value',
				new Date().toLocaleDateString('en-GB')
			)
		})
	})

	// TODO fix these tests
	// describe('modal interactions', () => {
	// 	it('opens refund modal when dragging to delivered column', () => {
	// 		mock.onPost(`/api/orders/${storedOrder.id}`).replyOnce(200)
	// 		cy.drag('.order-card', '[data-testid=returned]').should(
	// 			'contain',
	// 			storedOrder.first_name + ' ' + storedOrder.last_name
	// 		)

	// 		cy.get('[data-testid=refund-modal]').should('be.visible')
	// 		// TODO workout how to stop db request failing after this drag.
	// 	})

	// 	it('opens refund modal when dragging from the delivered column to elsewhere', () => {
	// 		// TODO setup order as returned.
	// 		cy.drag('.order-card', '[data-testid=upcoming]').should(
	// 			'contain',
	// 			storedOrder.first_name + ' ' + storedOrder.last_name
	// 		)

	// 		cy.get('[data-testid=refund-modal]').should('be.visible')
	// 	})
	// 		// TODO modals open on drags
	// 		// TODO modals submit data to API
	// 		// TODO reset buttons work
	// 	})
})

after(() => {
	cy.task('cleanup')
})
