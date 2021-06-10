import {
	bookings,
	generateEndDate,
	generateStartDate,
} from '@fixtures/bookingFixtures'
import { locations } from '@fixtures/locationFixtures'
import { storedOrder } from '@fixtures/orderFixtures'
import { extractBookingStart } from '@utils/date'
import { fulfilments } from '../../src/test/fixtures/fulfilmentFixtures'
import { refunds } from '../../src/test/fixtures/refundFixtures'
import { setStorage } from '../helpers/localStorageHelper'

before(() => {
	cy.task('defaults:db')
})

beforeEach(() => {
	cy.clearCookies()
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
	cy.intercept('POST', `/api/orders/${storedOrder.id}`, { statusCode: 200 })

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
		setStorage({ minDate: generateStartDate(), maxDate: generateEndDate() })
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

describe('modal interactions', () => {
	beforeEach(() => {
		cy.task('DBClear', { tableName: 'fulfilments' })
		cy.task('DBClear', { tableName: 'refunds' })
		cy.task('DBClear', { tableName: 'orders' })
		setStorage({ minDate: generateStartDate(), maxDate: generateEndDate() })
	})

	it('opens refund modal when dragging to returned column', () => {
		cy.intercept('POST', `/api/orders/${storedOrder.id}`, { statusCode: 200 })
		cy.task('DBInsert', {
			tableName: 'orders',
			data: [storedOrder],
		})
		cy.reload()

		cy.drag('.order-card', '[data-testid=returned]').should(
			'contain',
			storedOrder.first_name + ' ' + storedOrder.last_name
		)

		cy.get('[data-testid=refund-modal]').should('be.visible')
	})

	it('opens refund modal when dragging from the returned column to elsewhere', () => {
		cy.intercept('POST', `/api/orders/${storedOrder.id}`, { statusCode: 200 })
		cy.task('DBInsert', {
			tableName: 'orders',
			data: [{ ...storedOrder, fulfilled: true, returned: true }],
		})
		cy.reload()

		cy.drag('.order-card', '[data-testid=upcoming]').should(
			'contain',
			storedOrder.first_name + ' ' + storedOrder.last_name
		)

		cy.get('[data-testid=refund-modal]').should('be.visible')
	})

	it('allows accidental moves to be reset when moving to returned', () => {
		cy.intercept('POST', `/api/orders/${storedOrder.id}`, { statusCode: 200 })
		cy.task('DBInsert', {
			tableName: 'orders',
			data: [storedOrder],
		})
		cy.reload()

		cy.drag('.order-card', '[data-testid=returned]').should(
			'contain',
			storedOrder.first_name + ' ' + storedOrder.last_name
		)

		cy.get('[data-testid=refund-modal]').should('be.visible')
		cy.get('[data-testid=reset-button]').click()
		cy.get('.order-card')
			.should('be.visible')
			.parent()
			.should('have.attr', 'data-rbd-droppable-id', 'upcoming')
	})

	it('allows accidental moves to be reset when moving from returned', () => {
		cy.intercept('POST', `/api/orders/${storedOrder.id}`, { statusCode: 200 })
		cy.task('DBInsert', {
			tableName: 'orders',
			data: [{ ...storedOrder, fulfilled: true, returned: true }],
		})
		cy.reload()

		cy.drag('.order-card', '[data-testid=upcoming]').should(
			'contain',
			storedOrder.first_name + ' ' + storedOrder.last_name
		)

		cy.get('[data-testid=refund-modal]').should('be.visible')
		cy.get('[data-testid=reset-button]').click()
		cy.get('.order-card')
			.should('be.visible')
			.parent()
			.should('have.attr', 'data-rbd-droppable-id', 'returned')
	})

	describe('data transmission', () => {
		it('informs the API when an order changes columns', () => {
			cy.intercept('POST', `/api/orders/${storedOrder.id}`, (req) => {
				expect(req.body).to.deep.equal({
					fulfilled: true,
					returned: false,
				})
			})
			cy.task('DBInsert', {
				tableName: 'orders',
				data: [storedOrder],
			})
			cy.reload()

			cy.drag('.order-card', '[data-testid=delivered]').should(
				'contain',
				storedOrder.first_name + ' ' + storedOrder.last_name
			)
		})

		it('sends a refund request to the API when the refund modal is filled in', () => {
			const damageDetails = 'Minor damage.'
			cy.intercept('POST', `/api/orders/${storedOrder.id}`, (req) => {
				expect(req.body).to.deep.equal({
					fulfilled: true,
					returned: true,
				})
			})
			cy.intercept('POST', `/api/refunds/${storedOrder.id}`, (req) => {
				expect(req.body).to.deep.equal({
					damaged: true,
					damage_information: damageDetails,
				})
			}).as('create-refund')
			cy.task('DBInsert', {
				tableName: 'orders',
				data: [storedOrder],
			})
			cy.reload()

			cy.drag('.order-card', '[data-testid=returned]').should(
				'contain',
				storedOrder.first_name + ' ' + storedOrder.last_name
			)

			cy.get('[data-testid=refund-modal]').should('be.visible')
			cy.get('[data-testid=damage-checkbox]').click()
			cy.get('[data-testid=damage-details]').type(damageDetails)
			cy.get('[data-testid=submit-button]').click()
			cy.wait('@create-refund')
		})

		it('sends a request to delete a refund when an order moves from returned', () => {
			cy.intercept('POST', `/api/orders/${storedOrder.id}`, (req) => {
				expect(req.body).to.deep.equal({
					fulfilled: false,
					returned: false,
				})
			})
			cy.intercept('DELETE', `/api/refunds/${storedOrder.id}`).as(
				'delete-refund'
			)

			cy.task('DBInsert', {
				tableName: 'orders',
				data: [{ ...storedOrder, fulfilled: true, returned: true }],
			})
			cy.task('DBInsert', {
				tableName: 'refunds',
				data: [refunds[0]],
			})
			cy.task('DBInsert', {
				tableName: 'fulfilments',
				data: [{ ...fulfilments[0], status: 'returned' }],
			})
			cy.reload()

			cy.drag('.order-card', '[data-testid=upcoming]').should(
				'contain',
				storedOrder.first_name + ' ' + storedOrder.last_name
			)

			cy.get('[data-testid=refund-modal]').should('be.visible')
			cy.get('[data-testid=submit-button]').click()
			cy.wait('@delete-refund')
		})
	})
})

after(() => {
	cy.task('cleanup')
})
