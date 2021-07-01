import { ResetPasswordResponse } from '@typings/api/Accounts'
import {
	EmailRequest,
	ValidateConfirmationCodeResponse,
	VerifyEmailResponse,
} from '@typings/api/Email'
import { addHours } from 'date-fns'
import { setStorage } from '../helpers/localStorageHelper'

before(() => {
	cy.task('addAccounts')
})

beforeEach(() => {
	cy.clearLocalStorage()
	setStorage({
		consent: JSON.stringify({
			value: 'true',
			exp: addHours(new Date(), 2).getTime(),
		}),
	})
	cy.visit('/reset')
})

describe('email address field', () => {
	it('requires an email address associated with an existing account', () => {
		const emailAddress = 'no-reply@harryshottubs.com'

		cy.intercept('POST', '/api/accounts/reset').as('apiCall')

		cy.get('[aria-label=email]').type(emailAddress).as('emailField')
		cy.get('[aria-label=email-validation-button]')
			.as('validateEmailButton')
			.click()
		cy.wait('@apiCall')

		cy.get('#email-error').should('be.visible')
	})

	it('accepts valid confirmation codes', () => {
		const confirmationCode = 'ABC123'
		const emailAddress = 'no-reply@harryshottubs.com'

		cy.intercept('POST', '/api/accounts/reset', (req) => {
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

		cy.get('[aria-label=confirmation-code]').type(confirmationCode)
		cy.get('[aria-label=confirmation-code-validation-button]').click()
		cy.wait('@apiCall')

		cy.get('@emailField').should('be.disabled').should('have.class', 'is-valid')
	})

	it('rejects invalid confirmation codes', () => {
		const confirmationCode = 'ABC123'
		const emailAddress = 'no-reply@harryshottubs.com'

		cy.intercept('POST', '/api/accounts/reset', (req) => {
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

		cy.get('@confirmationCodeField').should('have.class', 'is-invalid')
		cy.get('#confirmation-code-error').should('be.visible')
	})
})

describe('password field', () => {
	it('appears when the email address is verified', () => {
		const confirmationCode = 'ABC123'
		const emailAddress = 'no-reply@harryshottubs.com'

		cy.intercept('POST', '/api/accounts/reset', (req) => {
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

		cy.get('[aria-label=password]').as('passwordField').should('not.exist')

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

		cy.get('@emailField').should('be.disabled').should('have.class', 'is-valid')
		cy.get('@validateEmailButton').should('not.exist')
		cy.get('@confirmationCodeField').should('not.exist')
		cy.get('@confirmationCodeButton').should('not.exist')
		cy.get('[aria-label=password]').as('passwordField').should('be.visible')
	})

	describe('with email field filled', () => {
		beforeEach(() => {
			const confirmationCode = 'ABC123'
			const emailAddress = 'no-reply@harryshottubs.com'

			cy.intercept('POST', '/api/accounts/reset', (req) => {
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
		})

		it('shows the user the strength of their password', () => {
			cy.get('[aria-label=password]').as('password').type('password')
			cy.get('[data-testid=password-strength]')
				.as('strengthText')
				.should('contain.text', 'Terrible')
			cy.get('.strength-meter-fill')
				.as('strengthMeter')
				.should('have.attr', 'style')
				.and('include', 'width: 0%')

			cy.get('@password').clear().type('H&5E8eN$DHnnycm5')
			cy.get('@strengthText').should('contain.text', 'Strong')
			cy.get('@strengthMeter')
				.should('have.attr', 'style')
				.and('include', 'width: 100%')
		})

		it('allows the user to see their password', () => {
			const password = 'password'
			cy.get('[aria-label=password]').as('password').type(password)
			cy.get('[data-testid=visibility-toggle]').click()
			cy.get('@password')
				.should('have.attr', 'type', 'text')
				.should('have.value', password)
		})

		it('provides feedback on how to improve the entered password', () => {
			const password = 'password'
			cy.get('[aria-label=password]').type(password)
			cy.get('[data-testid=recommendations]').should('exist')
		})

		it('indicates at what strength the password will be accepted', () => {
			const password = 'H&5E8eN$DHnnycm5'
			cy.get('[data-testid=reset-password-button-container]')
				.as('buttonContainer')
				.trigger('mouseover')
			cy.get('#reset-password-button-tooltip')
				.as('tooltip')
				.should('contain.text', 'increase the strength of your password')

			cy.get('[aria-label=password]').type(password).blur()

			cy.get('[data-testid=submit-button]').trigger('mouseover')
			cy.get('@tooltip').should('not.exist')
		})
	})
})

describe('submit button', () => {
	it('shows a tooltip telling the user to validate their email', () => {
		cy.get('[data-testid=reset-password-button-container]').trigger('mouseover')
		cy.get('#reset-password-button-tooltip').should(
			'contain.text',
			'Please confirm your email address.'
		)
	})

	it('shows a tooltip telling the user to improve their password when their email address is entered', () => {
		const confirmationCode = 'ABC123'
		const emailAddress = 'no-reply@harryshottubs.com'

		cy.intercept('POST', '/api/accounts/reset', (req) => {
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

		cy.get('[data-testid=reset-password-button-container]').trigger('mouseover')
		cy.get('#reset-password-button-tooltip').should(
			'contain.text',
			'Please increase the strength of your password.'
		)
	})

	it('shows an error if submission is unsuccessful', () => {
		const confirmationCode = 'ABC123'
		const emailAddress = 'no-reply@harryshottubs.com'
		const password = 'H&5E8eN$DHnnycm5'
		const errorMessage = 'Failed to reset your password.'

		cy.intercept('POST', '/api/accounts/reset', (req) => {
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

		cy.intercept('PATCH', '/api/accounts/reset', {
			statusCode: 200,
			body: { error: true, message: errorMessage } as ResetPasswordResponse,
		}).as('resetRequest')

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

		cy.get('[aria-label=password]').type(password).blur()
		cy.get('[data-testid=submit-button]').click()
		cy.wait('@resetRequest')

		cy.get('[data-testid=account-update-alert]').contains(errorMessage)
	})

	it('shows a success message if submission is successful', () => {
		const confirmationCode = 'ABC123'
		const emailAddress = 'no-reply@harryshottubs.com'
		const password = 'H&5E8eN$DHnnycm5'

		cy.intercept('POST', '/api/accounts/reset', (req) => {
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

		cy.intercept('PATCH', '/api/accounts/reset', {
			statusCode: 200,
			body: { error: false, reset: true } as ResetPasswordResponse,
		}).as('resetRequest')

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

		cy.get('[aria-label=password]').type(password).blur()
		cy.get('[data-testid=submit-button]').click()
		cy.wait('@resetRequest')

		cy.get('[data-testid=account-update-alert]').contains(
			'Your password has been successfully updated.'
		)
	})
})

after(() => {
	cy.task('cleanup')
})
