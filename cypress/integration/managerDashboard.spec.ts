import { fulfilments } from '@fixtures/fulfilmentFixtures'
import { locations } from '@fixtures/locationFixtures'
import { storedOrder } from '@fixtures/orderFixtures'
import { refunds } from '@fixtures/refundFixtures'
import { addHours } from 'date-fns'
import { setStorage } from '../helpers/localStorageHelper'

before(() => {
	cy.task('defaults:db')
})

beforeEach(() => {
	cy.intercept('GET', '/api/orders').as('getOrders')

	cy.clearCookies()
	cy.clearLocalStorage()
	setStorage({
		consent: JSON.stringify({
			value: 'true',
			exp: addHours(new Date(), 2).getTime(),
		}),
	})
	cy.task('generateToken', { index: 0 }).then((token: string) =>
		cy.setCookie('token', token)
	)
	cy.visit('/dashboard')

	cy.wait('@getOrders')
})

it('sets the page title', () => {
	cy.title().should('equal', 'Dashboard')
})

it('displays loading to the user whilst loading', () => {
	cy.get('[data-testid=loading-indicator]').should('exist')
})

it('allows the user to log out', () => {
	cy.intercept('GET', '/api/refunds').as('refunds')
	cy.intercept('GET', '/api/fulfilments').as('fulfilments')
	cy.intercept('GET', '/api/locations').as('locations')

	cy.wait('@refunds')
	cy.wait('@fulfilments')
	cy.wait('@locations')

	cy.get('[data-testid=logout-button]').click()
	cy.location('pathname').should('eq', '/login')
})

describe('refund manager', () => {
	beforeEach(() => {
		cy.task('DBInsert', { tableName: 'refunds', data: [refunds[0]] })
	})

	it('shows existing refunds', () => {
		cy.get('.card.refund').as('refund-card').should('be.visible')
		cy.get('[data-testid=customer-name]').should(
			'have.text',
			storedOrder.first_name + ' ' + storedOrder.last_name
		)
		cy.get('[data-testid=damage-status]').should(
			'have.text',
			refunds[0].damaged ? 'Damage Incurred' : 'No Damage'
		)
		cy.get('[data-testid=damage-details]').should('not.exist')
		cy.get('[data-testid=settle-button]').should('exist')
	})

	it('allows refunds to be dismissed', () => {
		cy.get('[data-testid=settle-button]').click()
		cy.get('.card.refund').should('not.exist')
		cy.get('.refund-manager')
			.children('h5')
			.should('contain.text', 'All refunds settled.')
	})

	afterEach(() => {
		cy.task('DBClear', { tableName: 'refunds' })
	})
})

describe('upcoming orders', () => {
	it('shows orders after today', () => {
		cy.get('.card.upcoming').should('have.length.at.most', 10)
		cy.get('[data-testid=order-date]').each(($date) => {
			const currentDate = new Date()
			const [day, month, year] = $date
				.text()
				.split('/')
				.map((part) => Number(part))
			const orderDate = new Date(year, month - 1, day)
			expect(orderDate).to.be.gte(currentDate)
		})
	})
})

describe('recent changes', () => {
	beforeEach(() => {
		const yesterday = new Date()
		const today = new Date()

		yesterday.setDate(today.getDate() - 1)
		cy.task('DBInsert', {
			tableName: 'fulfilments',
			data: [{ ...fulfilments[1], created_at: yesterday.toISOString() }],
		})
	})

	it('shows recent changes when locations are selected', () => {
		cy.get('.rbt-input-main').type(locations[0].name)
		cy.get(`[aria-label=${locations[0].name}]`).click()
		cy.get('.recently-fulfilled')
			.children('.card')
			.should(
				'contain.text',
				storedOrder.first_name + ' ' + storedOrder.last_name
			)
	})
})

after(() => {
	cy.task('cleanup')
})
