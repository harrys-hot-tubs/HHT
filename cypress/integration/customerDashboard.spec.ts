import {
	DeleteAccountResponse,
	PostAccountResponse,
} from '@typings/api/Accounts'
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

describe('GDPR request', () => {
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
})

describe('account deletion', () => {
	it('displays a confirmation modal when the delete account button is clicked', () => {
		cy.get('[data-testid=delete-account-button]').click()
		cy.get('[data-testid=delete-account-modal]').should('be.visible')
	})

	it('allows the confirmation modal to be dismissed', () => {
		cy.get('[data-testid=delete-account-button]').click()
		cy.get('[data-testid=delete-account-modal]')
			.as('modal')
			.should('be.visible')
		cy.get('.close').click()
		cy.get('@modal').should('not.exist')
	})

	it('starts with the delete account button disabled', () => {
		cy.get('[data-testid=delete-account-button]').click()
		cy.get('[data-testid=delete-account-modal]').should('be.visible')
		cy.get('[data-testid=delete-account-confirmation-button]')
			.should('be.visible')
			.should('be.disabled')
	})

	it("enables the delete account button when the user's email is typed into the field", () => {
		cy.get('[data-testid=delete-account-button]').click()
		cy.get('[data-testid=delete-account-modal]').should('be.visible')
		cy.get('[data-testid=delete-account-confirmation-button]')
			.as('confirmationButton')
			.should('be.visible')
			.should('be.disabled')

		cy.get('[data-testid=confirmation-field]').type(accounts[2].email_address)
		cy.get('@confirmationButton').should('not.be.disabled')
	})

	it('sends a request to delete the account when the delete account button is clicked', () => {
		cy.intercept('DELETE', `/api/accounts/${accounts[2].account_id}`, {
			statusCode: 200,
		}).as('deleteRequest')

		cy.get('[data-testid=delete-account-button]').click()
		cy.get('[data-testid=delete-account-modal]').should('be.visible')
		cy.get('[data-testid=delete-account-confirmation-button]')
			.as('confirmationButton')
			.should('be.visible')
			.should('be.disabled')

		cy.get('[data-testid=confirmation-field]').type(accounts[2].email_address)
		cy.get('@confirmationButton').should('not.be.disabled').click()

		cy.wait('@deleteRequest')
	})

	it('on successful account deletion the user is redirected to the home page', () => {
		cy.intercept('DELETE', `/api/accounts/${accounts[2].account_id}`, {
			statusCode: 200,
			body: { error: false, deleted: true } as DeleteAccountResponse,
		}).as('deleteRequest')

		cy.get('[data-testid=delete-account-button]').click()
		cy.get('[data-testid=delete-account-modal]').should('be.visible')
		cy.get('[data-testid=delete-account-confirmation-button]')
			.as('confirmationButton')
			.should('be.visible')
			.should('be.disabled')

		cy.get('[data-testid=confirmation-field]').type(accounts[2].email_address)
		cy.get('@confirmationButton').should('not.be.disabled').click()

		cy.wait('@deleteRequest')
		cy.location('pathname').should('eq', '/')
		cy.getCookie('token').should('be.null')
	})
})

after(() => {
	cy.task('cleanup')
})
