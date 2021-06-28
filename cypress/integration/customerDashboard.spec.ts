import { PostAccountResponse } from '@typings/api/Accounts'
import { AccountDB } from '@typings/db/Account'
import { addHours } from 'date-fns'
import accounts from '../fixtures/accounts.json'
import { setStorage } from '../helpers/localStorageHelper'

before(() => {
	cy.task('DBInsert', { tableName: 'accounts', data: [accounts[2]] })
})

beforeEach(() => {
	cy.clearCookies()
	cy.clearLocalStorage()
	setStorage({
		consent: JSON.stringify({
			value: 'true',
			exp: addHours(new Date(), 2).getTime(),
		}),
	})
	cy.task('generateToken', { index: 2 }).then((token: string) =>
		cy.setCookie('token', token)
	)
	cy.visit('/dashboard')
})

it('sets the page title', () => {
	cy.title().should('equal', 'Dashboard')
})

it('displays the name of the customer', () => {
	const account = accounts[2]
	cy.get('h2')
		.should('be.visible')
		.should('contain.text', `${account.first_name} ${account.last_name}`)
})

it('adds an alert when making a GDPR request', () => {
	cy.intercept('POST', `/api/accounts/${accounts[2].account_id}`, {
		statusCode: 200,
		body: {
			error: false,
			sent: true,
		} as PostAccountResponse,
	})

	cy.get('[data-testid=gdpr-request-button]').click()
	cy.get('[data-testid=dashboard-alert]')
		.should('be.visible')
		.should('contain.text', 'Success')
})

it('disables the GDPR request button for an account with an active request', () => {
	cy.task('DBClear', { tableName: 'accounts' })
	cy.task('DBInsert', {
		tableName: 'accounts',
		data: [
			{
				...accounts[2],
				active_information_request: true,
			},
		] as AccountDB[],
	})

	cy.get('[data-testid=gdpr-request-button]').should('be.disabled')
})

it('displays a tooltip over the GDPR request button for an account with an active request', () => {
	cy.task('DBClear', { tableName: 'accounts' })
	cy.task('DBInsert', {
		tableName: 'accounts',
		data: [
			{
				...accounts[2],
				active_information_request: true,
			},
		] as AccountDB[],
	})

	cy.get('[data-testid=gdpr-request-button]').should('be.disabled')
	cy.get('[data-testid=tooltip-button-container]')
		.as('buttonContainer')
		.trigger('mouseover')
	cy.get('#gdpr-tooltip').should(
		'contain.text',
		'An information request has been already been filed for this account.'
	)
})

after(() => {
	cy.task('cleanup')
})
