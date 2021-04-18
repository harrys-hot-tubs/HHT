import { bookings } from '@fixtures/bookingFixtures'
import { locations } from '@fixtures/locationFixtures'
import { storedOrder } from '@fixtures/orderFixtures'
import { mixedSizes } from '@fixtures/tubsFixtures'
import { extractBookingStart } from '@utils/date'
import accounts from '../fixtures/accounts.json'
import { setStorage } from '../helpers/localStorageHelper'

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
		cy.get('.order-card').should('be.visible')
		cy.drag('.order-card', '[data-testid=delivered]').should(
			'contain',
			storedOrder.first_name + ' ' + storedOrder.last_name
		)
	})
})

after(() => {
	cy.task('cleanup').then(() => {})
})
