import { UserInformation } from '@components/SignUpForm'
import {
	EmailRequest,
	ValidateConfirmationCodeResponse,
	VerifyEmailResponse,
} from '@typings/api/Email'
import { AccountDB } from '@typings/db/Account'
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
	cy.visit('/signup')
})

it('sets the page title', () => {
	cy.title().should('eq', 'Sign Up')
})

it('redirects to the dashboard if a user is logged in', () => {
	cy.task('generateToken', { index: 1 }).then((token: string) =>
		cy.setCookie('token', token)
	)
	cy.reload()
	cy.url().should('eq', Cypress.config().baseUrl + '/dashboard')
})

describe('form', () => {
	describe('email field', () => {
		it('detects invalid emails', () => {
			cy.get('[aria-label=email]').type('email')
			cy.get('[aria-label=email-validation-button]').click()
			cy.get('#email-error').should('exist').should('contain.text', 'email')
		})

		it('accepts valid confirmation codes', () => {
			const confirmationCode = 'ABC123'
			const emailAddress = 'no-reply@harryshottubs.com'

			cy.intercept('POST', '/api/email', (req) => {
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

			cy.intercept('POST', '/api/email', (req) => {
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

	describe('password field', () => {
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
			cy.get('[data-testid=tooltip-button-container]')
				.as('buttonContainer')
				.trigger('mouseover')
			cy.get('#submit-button-tooltip')
				.as('tooltip')
				.should('contain.text', 'increase the strength of your password')

			cy.get('[aria-label=password]').type(password)

			cy.get('@buttonContainer').trigger('mouseover')
			cy.get('@tooltip').should(
				'not.contain.text',
				'increase the strength of your password'
			)
		})
	})

	it('takes in input from the first name field', () => {
		const firstName = 'John'
		cy.get('[aria-label=first-name]')
			.type(firstName)
			.should('have.value', firstName)

		cy.getLocalStorage('signUpInformation').should((signupInformation) => {
			const parsed: UserInformation = JSON.parse(signupInformation)
			expect(parsed.firstName).to.eql(firstName)
		})
	})

	it('takes in input from the last name field', () => {
		const lastName = 'Doe'
		cy.get('[aria-label=last-name]')
			.type(lastName)
			.should('have.value', lastName)

		cy.getLocalStorage('signUpInformation').should((signupInformation) => {
			const parsed: UserInformation = JSON.parse(signupInformation)
			expect(parsed.lastName).to.eql(lastName)
		})
	})

	it('takes in input from the telephone number field', () => {
		const telephoneNumber = '1-800-654-1984'
		cy.get('[aria-label=telephone]')
			.type(telephoneNumber)
			.should('have.value', telephoneNumber)

		cy.getLocalStorage('signUpInformation').should((signupInformation) => {
			const parsed: UserInformation = JSON.parse(signupInformation)
			expect(parsed.telephoneNumber).to.eql(telephoneNumber)
		})
	})

	it('stores non-password information after refresh', () => {
		const values: UserInformation = {
			emailAddress: 'no-reply@harryshottubs.com',
			firstName: 'John',
			lastName: 'Doe',
			telephoneNumber: '1-800-654-1984',
		}
		const password = 'password'

		cy.get('[aria-label=email]').as('email').type(values.emailAddress)
		cy.get('[aria-label=first-name]').as('firstName').type(values.firstName)
		cy.get('[aria-label=last-name]').as('lastName').type(values.lastName)
		cy.get('[aria-label=telephone]')
			.as('telephone')
			.type(values.telephoneNumber)
		cy.get('[aria-label=password]').as('password').type(password)

		cy.getLocalStorage('signUpInformation').should((signupInformation) => {
			const parsed: UserInformation = JSON.parse(signupInformation)
			expect(parsed).to.deep.equal(values)
		})

		cy.reload()

		cy.get('@email').should('have.value', values.emailAddress)
		cy.get('@firstName').should('have.value', values.firstName)
		cy.get('@lastName').should('have.value', values.lastName)
		cy.get('@telephone').should('have.value', values.telephoneNumber)
		cy.get('@password').should('have.value', '')
	})

	describe('submit button', () => {
		it('is disabled until the email is verified and the password is of appropriate strength', () => {
			const confirmationCode = 'ABC123'
			const emailAddress = 'no-reply@harryshottubs.com'
			const password = 'H&5E8eN$DHnnycm5'

			cy.intercept('POST', '/api/email', (req) => {
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

			cy.get('[data-testid=submit-button]')
				.as('submitButton')
				.should('be.disabled')

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

			cy.get('[aria-label=password]').type(password)

			cy.get('@submitButton').should('not.be.disabled')
		})

		it('shows a tooltip informing the user why it is disabled', () => {
			cy.get('[data-testid=tooltip-button-container]').trigger('mouseover')

			cy.get('#submit-button-tooltip').should('be.visible')
		})

		it('activates the alert if an error occurs during submission', () => {
			const confirmationCode = 'ABC123'
			const emailAddress = 'no-reply@harryshottubs.com'
			const password = 'H&5E8eN$DHnnycm5'

			cy.task('DBInsert', {
				tableName: 'accounts',
				data: [
					{
						account_id: 200,
						email_address: emailAddress,
						confirmation_code: confirmationCode,
						confirmed: false,
					} as Partial<AccountDB>,
				],
			})

			cy.intercept('POST', '/api/email', (req) => {
				const { body }: { body: EmailRequest } = req
				if (body.validate === true) {
					return req.reply()
				} else {
					return req.reply({
						error: false,
						inserted: true,
					} as VerifyEmailResponse)
				}
			}).as('emailCall')

			cy.intercept('POST', '/api/accounts', (req) => {
				return req.reply({ statusCode: 500 })
			}).as('accountsCall')

			cy.get('[data-testid=submit-button]')
				.as('submitButton')
				.should('be.disabled')

			cy.get('[aria-label=email]').type(emailAddress).as('emailField')
			cy.get('[aria-label=email-validation-button]')
				.as('validateEmailButton')
				.click()
			cy.wait('@emailCall')

			cy.get('[aria-label=confirmation-code]')
				.as('confirmationCodeField')
				.type(confirmationCode)
			cy.get('[aria-label=confirmation-code-validation-button]')
				.as('confirmationCodeButton')
				.click()
			cy.wait('@emailCall')

			cy.get('[aria-label=password]').type(password)
			cy.get('[aria-label=first-name]').type('John')
			cy.get('[aria-label=last-name]').type('Doe')
			cy.get('[aria-label=telephone]').type('1-800-654-1984')

			cy.get('@submitButton').should('not.be.disabled').click()
			cy.wait('@accountsCall')

			cy.get('[data-testid=alert-message]').should('be.visible')
		})

		it('redirects to the dashboard on a successful submission', () => {
			const confirmationCode = 'ABC123'
			const emailAddress = 'no-reply@harryshottubs.com'
			const password = 'H&5E8eN$DHnnycm5'

			cy.task('DBInsert', {
				tableName: 'accounts',
				data: [
					{
						account_id: 200,
						email_address: emailAddress,
						confirmation_code: confirmationCode,
						confirmed: false,
					} as Partial<AccountDB>,
				],
			})

			cy.intercept('POST', '/api/email', (req) => {
				const { body }: { body: EmailRequest } = req
				if (body.validate === true) {
					return req.reply()
				} else {
					return req.reply({
						error: false,
						inserted: true,
					} as VerifyEmailResponse)
				}
			}).as('apiCall')

			cy.get('[data-testid=submit-button]')
				.as('submitButton')
				.should('be.disabled')

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

			cy.get('[aria-label=password]').type(password)
			cy.get('[aria-label=first-name]').type('John')
			cy.get('[aria-label=last-name]').type('Doe')
			cy.get('[aria-label=telephone]').type('1-800-654-1984')

			cy.get('@submitButton').should('not.be.disabled').click()

			cy.location('pathname').should('eq', '/dashboard')
		})
	})

	afterEach(() => {
		cy.task('DBClear', { tableName: 'accounts' })
	})
})

after(() => {
	cy.task('cleanup')
})
