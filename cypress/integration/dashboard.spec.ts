import { bookings } from '@fixtures/bookingFixtures'
import { locations } from '@fixtures/locationFixtures'
import { storedOrder } from '@fixtures/orderFixtures'
import { mixedSizes } from '@fixtures/tubsFixtures'
import { setStorage } from '../helpers/localStorageHelper'

before(() => {
	cy.task('addAccount')
	cy.task('DBInsert', { tableName: 'locations', data: locations })
	cy.task('DBInsert', { tableName: 'tubs', data: mixedSizes })
	cy.task('DBInsert', { tableName: 'bookings', data: [bookings[0]] })
	cy.task('DBInsert', { tableName: 'orders', data: [storedOrder] })
})

beforeEach(() => {
	cy.clearLocalStorage()
	setStorage({ consent: 'true' })
	cy.task('generateToken').then((token: string) => cy.setCookie('token', token))
	cy.visit('/login')
})

it('sets the page title', () => {
	cy.title().should('equal', 'Dashboard')
})

describe('manager dashboard', () => {
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

// TODO add tests for driver dashboard.

after(() => {
	cy.task('cleanup').then(() => {})
})
