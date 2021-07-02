import {
	DeleteAccountResponse,
	GetAccountSuccess,
	PostAccountResponse,
	UpdateAccountRequest,
	UpdateAccountResponse,
} from '@typings/api/Accounts'
import {
	EmailRequest,
	ValidateConfirmationCodeResponse,
	VerifyEmailResponse,
} from '@typings/api/Email'
import { AccountDB } from '@typings/db/Account'
import { addHours } from 'date-fns'
import accounts from '../fixtures/accounts.json'
import { setStorage } from '../helpers/localStorageHelper'

before(() => {
	cy.task('DBInsert', { tableName: 'accounts', data: [accounts[2]] })
})

beforeEach(() => {
	cy.intercept('GET', `/api/accounts/${accounts[2].account_id}`).as(
		'getAccountInfo'
	)

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
	cy.wait('@getAccountInfo')
})

it('sets the page title', () => {
	cy.title().should('equal', 'Dashboard')
})

it('displays the name of the customer', () => {
	const account = accounts[2]
	cy.get('h1')
		.should('be.visible')
		.should('contain.text', `${account.first_name}`)
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
		cy.intercept('GET', `/api/accounts/${accounts[2].account_id}`).as(
			'getAccountInfo'
		)
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

		cy.reload()
		cy.wait('@getAccountInfo')

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
		cy.get('[data-testid=gdpr-request-button-container]')
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

describe('account update form', () => {
	it('does not allow submission of an empty form', () => {
		cy.get('[data-testid=update-account-button-container]').trigger('mouseover')
		cy.get('#update-account-button-tooltip').should(
			'contain.text',
			'Please alter your account information'
		)

		cy.get('[data-testid=submit-button]').should('be.disabled')
	})

	describe('email address field', () => {
		it('detects invalid emails', () => {
			cy.get('[aria-label=email]').type('email')
			cy.get('[aria-label=email-validation-button]').click()
			cy.get('#email-error').should('exist').should('contain.text', 'email')
		})

		it('accepts valid confirmation codes', () => {
			const confirmationCode = 'ABC123'
			const emailAddress = 'no-reply@harryshottubs.com'

			cy.intercept('POST', `/api/email/${accounts[2].account_id}`, (req) => {
				const { body }: { body: EmailRequest } = req
				if (body.validate === true) {
					return req.reply({
						valid: true,
						error: false,
					} as ValidateConfirmationCodeResponse)
				} else {
					return req.reply({
						error: false,
						inserted: true,
					} as VerifyEmailResponse)
				}
			}).as('apiCall')

			cy.get('[aria-label=email]').type(emailAddress).as('emailField')
			cy.get('[aria-label=email-validation-button]')
				.as('validateEmailButton')
				.click()
			cy.wait('@apiCall')

			cy.get('[aria-label=confirmation-code]')
				.as('confirmationCodeField')
				.type(confirmationCode)
			cy.get('[aria-label=confirmation-code-validation-button]')
				.as('confirmationCodeButton')
				.click()
			cy.wait('@apiCall')

			cy.get('@emailField')
				.should('be.disabled')
				.should('have.class', 'is-valid')
			cy.get('@validateEmailButton').should('not.exist')
			cy.get('@confirmationCodeField').should('not.exist')
			cy.get('@confirmationCodeButton').should('not.exist')
		})

		it('rejects invalid confirmation codes', () => {
			const confirmationCode = 'ABC123'
			const emailAddress = 'no-reply@harryshottubs.com'

			cy.intercept('POST', `/api/email/${accounts[2].account_id}`, (req) => {
				const { body }: { body: EmailRequest } = req
				if (body.validate === true) {
					return req.reply({
						valid: false,
						error: false,
					} as ValidateConfirmationCodeResponse)
				} else {
					return req.reply({
						error: false,
						inserted: true,
					} as VerifyEmailResponse)
				}
			}).as('apiCall')

			cy.get('[aria-label=email]').type(emailAddress).as('emailField')
			cy.get('[aria-label=email-validation-button]')
				.as('validateEmailButton')
				.click()
			cy.wait('@apiCall')

			cy.get('[aria-label=confirmation-code]')
				.as('confirmationCodeField')
				.type(confirmationCode)
			cy.get('[aria-label=confirmation-code-validation-button]')
				.as('confirmationCodeButton')
				.click()
			cy.wait('@apiCall')

			cy.get('#confirmation-code-error')
				.should('be.visible')
				.should('contain.text', 'Confirmation code not recognised.')
		})
	})

	it('shows the user a message with what fields they changed', () => {
		cy.intercept('PATCH', `/api/accounts/${accounts[2].account_id}`, (req) => {
			const { body }: { body: UpdateAccountRequest } = req
			expect(body).to.deep.equal({
				first_name: 'Wendell',
			} as UpdateAccountRequest)
			req.reply({
				error: false,
				updated: {
					...accounts[2],
					first_name: 'Wendell',
				},
			} as UpdateAccountResponse)
		}).as('accountUpdate')
		cy.intercept('GET', `/api/accounts/${accounts[2].account_id}`, {
			statusCode: 200,
			body: {
				error: false,
				account: {
					...accounts[2],
					first_name: 'Wendell',
				},
			} as GetAccountSuccess,
		}).as('accountRefresh')

		cy.get('[aria-label=first-name]').type('Wendell')
		cy.get('[data-testid=submit-button]').should('not.be.disabled').click()

		cy.wait('@accountUpdate')
		cy.wait('@accountRefresh')

		cy.get('[data-testid=account-update-alert]').contains('First name')

		cy.get('h1').should('contain.text', 'Wendell')
	})

	it('shows the user an error message if the update request fails', () => {
		cy.intercept('PATCH', `/api/accounts/${accounts[2].account_id}`, {
			statusCode: 500,
			body: { error: true, message: 'Update request failed.' },
		}).as('accountUpdate')
		cy.intercept('GET', `/api/accounts/${accounts[2].account_id}`, {
			statusCode: 200,
			body: {
				error: false,
				account: accounts[2],
			} as GetAccountSuccess,
		})

		cy.get('[aria-label=first-name]').type('Wendell')
		cy.get('[data-testid=submit-button]').should('not.be.disabled').click()

		cy.wait('@accountUpdate')

		cy.get('[data-testid=account-update-alert]').contains('Failure')
	})
})

after(() => {
	cy.task('cleanup')
})
