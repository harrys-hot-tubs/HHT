import {
	bookings,
	generateEndDate,
	generateStartDate,
} from '@fixtures/bookingFixtures'
import { fulfilments } from '@fixtures/fulfilmentFixtures'
import { locations } from '@fixtures/locationFixtures'
import { storedOrder } from '@fixtures/orderFixtures'
import { refunds } from '@fixtures/refundFixtures'
import { extractBookingStart } from '@utils/date'
import { addHours, isSameDay } from 'date-fns'
import { setStorage } from '../helpers/localStorageHelper'

interface LoadOptions {
	reload: boolean
}

const loadPage = (options?: LoadOptions) => {
	options?.reload ? cy.reload() : cy.visit('/dashboard')
	cy.wait('@getAccount')
	cy.wait('@getOrders')
}

before(() => {
	cy.task('defaults:db')
})

beforeEach(() => {
	cy.intercept('GET', '/api/orders').as('getOrders')
	cy.intercept('GET', '/api/accounts').as('getAccount')

	cy.clearCookies()
	cy.clearLocalStorage()
	setStorage({
		consent: JSON.stringify({
			value: 'true',
			exp: addHours(new Date(), 2).getTime(),
		}),
	})
	cy.task('generateToken', { index: 1 }).then((token: string) =>
		cy.setCookie('token', token)
	)
})

it('sets the page title', () => {
	loadPage()

	cy.title().should('equal', 'Dashboard')
})

it("displays a title indicating the driver's region", () => {
	loadPage()

	cy.get('h1').should('have.text', `Orders in ${locations[0].name}`)
})

it('display a card for each upcoming order', () => {
	setStorage({ minDate: generateStartDate(), maxDate: generateEndDate() })
	loadPage()

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
	loadPage()

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
		cy.visit('/dashboard')
		cy.wait('@getAccount')
		cy.wait('@getOrders')

		cy.task('DBInsert', { tableName: 'orders', data: [storedOrder] })
		cy.get('.order-card').should('not.exist')

		setStorage({ minDate: generateStartDate(), maxDate: generateEndDate() })

		loadPage({ reload: true })

		cy.get('.order-card')
			.should('be.visible')
			.parent()
			.should('have.attr', 'data-rbd-droppable-id', 'upcoming')
	})

	it('displays in date delivered orders', () => {
		cy.visit('/dashboard')
		cy.wait('@getAccount')
		cy.wait('@getOrders')

		cy.task('DBInsert', {
			tableName: 'orders',
			data: [{ ...storedOrder, fulfilled: true }],
		})

		cy.get('.order-card').should('not.exist')
		setStorage({ minDate: generateEndDate(), maxDate: generateEndDate() })

		loadPage({ reload: true })

		cy.get('.order-card')
			.should('be.visible')
			.parent()
			.should('have.attr', 'data-rbd-droppable-id', 'delivered')
	})

	it('displays in date returned orders', () => {
		cy.visit('/dashboard')
		cy.wait('@getAccount')
		cy.wait('@getOrders')

		cy.task('DBInsert', {
			tableName: 'orders',
			data: [{ ...storedOrder, fulfilled: true, returned: true }],
		})

		cy.get('.order-card').should('not.exist')
		setStorage({ minDate: generateStartDate(), maxDate: generateEndDate() })

		loadPage({ reload: true })

		cy.get('.order-card')
			.should('be.visible')
			.parent()
			.should('have.attr', 'data-rbd-droppable-id', 'returned')
	})
})

describe('calendar interaction', () => {
	beforeEach(() => {})

	it('allows the start date to be set', () => {
		cy.visit('/dashboard')
		cy.wait('@getAccount')
		cy.wait('@getOrders')

		cy.get('input#start').as('startDate').click()
		cy.get('div.react-datepicker__today-button').click()
		cy.get('@startDate').should(
			'have.attr',
			'value',
			new Date().toLocaleDateString('en-GB')
		)

		cy.getLocalStorage('minDate').then((minDate) => {
			expect(isSameDay(new Date(minDate), new Date())).to.be.true
		})
	})

	it('allows the end date to be set', () => {
		cy.visit('/dashboard')
		cy.wait('@getAccount')
		cy.wait('@getOrders')

		cy.get('input#end').as('endDate').click()
		cy.get('div.react-datepicker__today-button').click()
		cy.get('@endDate').should(
			'have.attr',
			'value',
			new Date().toLocaleDateString('en-GB')
		)

		cy.getLocalStorage('maxDate').then((maxDate) => {
			expect(isSameDay(new Date(maxDate), new Date())).to.be.true
		})
	})

	it('persists dates between reloads', () => {
		cy.visit('/dashboard')
		cy.wait('@getAccount')
		cy.wait('@getOrders')

		setStorage({ minDate: generateStartDate() })
		cy.get('input#start').as('startDate').click()
		cy.get('div.react-datepicker__today-button').click()

		cy.get('@startDate').should(
			'have.attr',
			'value',
			new Date().toLocaleDateString('en-GB')
		)

		loadPage({ reload: true })

		cy.get('@startDate').should(
			'have.attr',
			'value',
			new Date().toLocaleDateString('en-GB')
		)
	})

	it('is impossible to mis-order dates', () => {
		setStorage({ minDate: generateEndDate() })
		cy.visit('/dashboard')
		cy.wait('@getAccount')
		cy.wait('@getOrders')

		cy.get('input#end').click()
		cy.get('div.react-datepicker__today-button').click()
		cy.get('input#end').should('have.attr', 'value', '')
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
		cy.visit('/dashboard')
		cy.wait('@getAccount')
		cy.wait('@getOrders')

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
		cy.visit('/dashboard')
		cy.wait('@getAccount')
		cy.wait('@getOrders')

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
		cy.visit('/dashboard')
		cy.wait('@getAccount')
		cy.wait('@getOrders')

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
		cy.visit('/dashboard')
		cy.wait('@getAccount')
		cy.wait('@getOrders')

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
				req.continue()
			}).as('statusChange')

			cy.task('DBInsert', {
				tableName: 'orders',
				data: [storedOrder],
			})
			cy.visit('/dashboard')
			cy.wait('@getAccount')
			cy.wait('@getOrders')

			cy.drag('.order-card', '[data-testid=delivered]').should(
				'contain',
				storedOrder.first_name + ' ' + storedOrder.last_name
			)
			cy.wait('@statusChange')
		})

		it('sends a refund request to the API when the refund modal is filled in', () => {
			const damageDetails = 'Minor damage.'
			cy.intercept('POST', `/api/orders/${storedOrder.id}`, (req) => {
				expect(req.body).to.deep.equal({
					fulfilled: true,
					returned: true,
				})
				req.continue()
			}).as('statusChange')
			cy.intercept('POST', `/api/refunds/${storedOrder.id}`, (req) => {
				expect(req.body).to.deep.equal({
					damaged: true,
					damage_information: damageDetails,
				})
				req.continue()
			}).as('create-refund')
			cy.task('DBInsert', {
				tableName: 'orders',
				data: [storedOrder],
			})
			cy.visit('/dashboard')
			cy.wait('@getAccount')
			cy.wait('@getOrders')

			cy.drag('.order-card', '[data-testid=returned]').should(
				'contain',
				storedOrder.first_name + ' ' + storedOrder.last_name
			)
			cy.wait('@statusChange')

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
				req.continue()
			}).as('statusChange')
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
			cy.visit('/dashboard')
			cy.wait('@getAccount')
			cy.wait('@getOrders')

			cy.drag('.order-card', '[data-testid=upcoming]').should(
				'contain',
				storedOrder.first_name + ' ' + storedOrder.last_name
			)

			cy.wait('@statusChange')

			cy.get('[data-testid=refund-modal]').should('be.visible')
			cy.get('[data-testid=submit-button]').click()
			cy.wait('@delete-refund')
		})
	})
})

after(() => {
	cy.task('cleanup')
})
