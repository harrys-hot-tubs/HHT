import { RefereeOptions } from '@components/CheckoutForm'
import { bookings } from '@fixtures/bookingFixtures'
import { locations } from '@fixtures/locationFixtures'
import { formData, validCheckoutInformation } from '@fixtures/paymentFixtures'
import { tubs } from '@fixtures/tubFixtures'
import { CheckoutInformation, Fallback } from '@hooks/useCheckoutInformation'
import { BookingData } from '@pages/checkout'
import { BookingDB } from '@typings/db/Booking'
import { addHours } from 'date-fns'
import { setStorage } from '../helpers/localStorageHelper'

before(() => {
	cy.task('DBInsert', { tableName: 'locations', data: locations })
	cy.task('DBInsert', { tableName: 'tubs', data: tubs })
})

beforeEach(() => {
	setStorage({
		consent: JSON.stringify({
			value: 'true',
			exp: addHours(new Date(), 2).getTime(),
		}),
	})

	cy.task('DBInsert', {
		tableName: 'bookings',
		data: {
			...bookings[0],
			reserved: true,
			booking_duration: `[${formData.startDate},${formData.endDate})`,
		} as BookingDB,
	})

	setStorage({
		bookingData: JSON.stringify({
			bookingID: 1,
			exp: Date.now() + 9.5 * 60 * 1000,
			startTime: new Date(),
		} as BookingData),
	})

	setStorage(formData)
	cy.visit('/checkout?tub_id=1')
})

it('sets the page title', () => {
	cy.title().should('eq', 'Checkout')
})

it('redirects to hire if data is not present', () => {
	cy.clearLocalStorage()
	cy.visit('/checkout')
	cy.location('pathname').should('eq', '/hire')
})

describe('rendering', () => {
	it('renders postcode field', () => {
		cy.get('[aria-label=postcode]')

			.should('exist')
			.should('have.attr', 'placeholder', formData.postcode)
			.should('have.attr', 'readonly')
	})

	it('renders referee field', () => {
		cy.get('[aria-label=referee]').should('exist')

		cy.get('[data-testid=referees]')
			.should('exist')
			.children()
			.should('have.length', RefereeOptions.length)
	})

	it('renders requests field', () => {
		cy.get('[aria-label=requests]').should('exist')
	})

	it('renders start date field', () => {
		const storedDate = formData.startDate
		const expectedOutput = new Date(storedDate).toLocaleDateString()

		cy.get('[aria-label=start-date]')

			.should('exist')
			.should('have.attr', 'placeholder', expectedOutput)
			.should('have.attr', 'disabled')
	})

	it('renders end date field', () => {
		const storedDate = formData.endDate
		const expectedOutput = new Date(storedDate).toLocaleDateString()

		cy.get('[aria-label=end-date]')

			.should('exist')
			.should('have.attr', 'placeholder', expectedOutput)
			.should('have.attr', 'disabled')
	})

	it('renders only these fields', () => {
		cy.get('.form-group').should('have.length', 12)
	})
})

describe('data entry', () => {
	it('takes in data from the first name field', () => {
		const { firstName } = validCheckoutInformation
		cy.get('[aria-label=first-name]').type(firstName)
		cy.getLocalStorage('checkoutInformation').should(
			'eq',
			JSON.stringify({
				...Fallback,
				firstName,
			} as CheckoutInformation)
		)
	})

	it('takes in data from the last name field', () => {
		const { lastName } = validCheckoutInformation
		cy.get('[aria-label=last-name]').type(lastName)
		cy.getLocalStorage('checkoutInformation').should(
			'eq',
			JSON.stringify({
				...Fallback,
				lastName,
			} as CheckoutInformation)
		)
	})

	it('takes in data from the email field', () => {
		const { email } = validCheckoutInformation
		cy.get('[aria-label=email]').type(email)
		cy.getLocalStorage('checkoutInformation').should(
			'eq',
			JSON.stringify({
				...Fallback,
				email,
			} as CheckoutInformation)
		)
	})

	it('takes in data from the telephone number field', () => {
		const { telephoneNumber } = validCheckoutInformation
		cy.get('[aria-label=telephone]').type(telephoneNumber)
		cy.getLocalStorage('checkoutInformation').should(
			'eq',
			JSON.stringify({
				...Fallback,
				telephoneNumber,
			} as CheckoutInformation)
		)
	})

	it('takes in data from the address line 1 field', () => {
		const { addressLine1 } = validCheckoutInformation
		cy.get('[aria-label=address1]').type(addressLine1)
		cy.getLocalStorage('checkoutInformation').should(
			'eq',
			JSON.stringify({
				...Fallback,
				addressLine1,
			} as CheckoutInformation)
		)
	})

	it('takes in data from the address line 2 field', () => {
		const { addressLine2 } = validCheckoutInformation
		cy.get('[aria-label=address2]').type(addressLine2)
		cy.getLocalStorage('checkoutInformation').should(
			'eq',
			JSON.stringify({
				...Fallback,
				addressLine2,
			} as CheckoutInformation)
		)
	})

	it('takes in data from the address line 3 field', () => {
		const { addressLine3 } = validCheckoutInformation
		cy.get('[aria-label=address3]').type(addressLine3)
		cy.getLocalStorage('checkoutInformation').should(
			'eq',
			JSON.stringify({
				...Fallback,
				addressLine3,
			} as CheckoutInformation)
		)
	})

	it('takes in data from the referee field', () => {
		const { referee } = validCheckoutInformation
		cy.get('[aria-label=referee]').type(referee)
		cy.getLocalStorage('checkoutInformation').should(
			'eq',
			JSON.stringify({
				...Fallback,
				referee,
			} as CheckoutInformation)
		)
	})

	it('takes in data from the requests field', () => {
		const { specialRequests } = validCheckoutInformation
		cy.get('[aria-label=requests]').type(specialRequests)
		cy.getLocalStorage('checkoutInformation').should(
			'eq',
			JSON.stringify({
				...Fallback,
				specialRequests,
			} as CheckoutInformation)
		)
	})

	it('indicates invalid fields on the form', () => {
		cy.fillElementsInput('cardNumber', '4242424242424242')
		cy.fillElementsInput('cardExpiry', '1225')
		cy.fillElementsInput('cardCvc', '123')

		cy.get('.checkout-button', { timeout: 10000 })
			.should('not.be.disabled')
			.click()

		cy.get('[role=alert]')
			.should('have.length.within', 8, 12)
			.each((message) => {
				expect(message).to.have.css('display', 'block')
				expect(message).not.to.have.css('display', 'none')
			})
	})
})

describe('credit card field', () => {
	beforeEach(() => {
		cy.setLocalStorage(
			'checkoutInformation',
			JSON.stringify(validCheckoutInformation)
		)
		cy.reload()
	})

	it('shows error messages on card_error', () => {
		cy.get('.time').should('be.visible')
		cy.fillElementsInput('cardNumber', '4000000000000002')
		cy.fillElementsInput('cardExpiry', '1225')
		cy.fillElementsInput('cardCvc', '123')
		cy.get('.checkout-button', { timeout: 10000 })
			.should('not.be.disabled')
			.click()

		cy.get('[data-testid=payment-alert]', { timeout: 10000 }).should(
			'be.visible'
		)
		cy.get('[data-testid=payment-alert-heading]')
			.should('be.visible')
			.should('contain.text', 'Payment Failed')
		cy.get('[data-testid=payment-alert-message]').should('be.visible')
	})

	it('shows error messages on validation_error', () => {
		cy.get('.time').should('be.visible')
		cy.fillElementsInput('cardNumber', '4000000000000069')
		cy.fillElementsInput('cardExpiry', '1225')
		cy.fillElementsInput('cardCvc', '123')
		cy.get('.checkout-button', { timeout: 10000 })
			.should('not.be.disabled')
			.click()

		cy.get('[data-testid=payment-alert]', { timeout: 10000 }).should(
			'be.visible'
		)
		cy.get('[data-testid=payment-alert-heading]')
			.should('be.visible')
			.should('contain.text', 'Payment Failed')
		cy.get('[data-testid=payment-alert-message]').should('be.visible')
	})

	it('shows error messages on api_error', () => {
		cy.get('.time').should('be.visible')
		cy.fillElementsInput('cardNumber', '4000000000000119')
		cy.fillElementsInput('cardExpiry', '1225')
		cy.fillElementsInput('cardCvc', '123')
		cy.get('.checkout-button', { timeout: 10000 })
			.should('not.be.disabled')
			.click()

		cy.get('[data-testid=payment-alert]', { timeout: 10000 }).should(
			'be.visible'
		)
		cy.get('[data-testid=payment-alert-heading]')
			.should('be.visible')
			.should('contain.text', 'Payment Failed')
		cy.get('[data-testid=payment-alert-message]').should('be.visible')
	})

	it('shows error messages on authentication_error', () => {
		cy.get('.time').should('be.visible')
		cy.fillElementsInput('cardNumber', '4000002760003184')
		cy.fillElementsInput('cardExpiry', '1225')
		cy.fillElementsInput('cardCvc', '123')
		cy.get('.checkout-button', { timeout: 10000 })
			.should('not.be.disabled')
			.click()

		// cy.contains('Fail Authentication').click()
		// TODO find out how to click the fail authentication button.
	})

	it('redirects to the success page on a successful checkout', () => {
		cy.get('.time').should('be.visible')
		cy.fillElementsInput('cardNumber', '4242424242424242')
		cy.fillElementsInput('cardExpiry', '1225')
		cy.fillElementsInput('cardCvc', '123')

		cy.get('.checkout-button', { timeout: 10000 })
			.should('not.be.disabled')
			.click()

		cy.location('pathname').should('eq', '/success')
	})
})

describe('countdown', () => {
	it('decreases over time', () => {
		cy.get('.time').then(($time) => {
			const [startMinutes, startSeconds] = $time.text().toString().split(':')
			cy.wrap(startSeconds).as('startSeconds')
			cy.wrap(startMinutes).as('startMinutes')
		})

		// ! Cannot use cy.clock as the timer does not user setInterval, it uses CSS animation
		cy.wait(1000)

		cy.get('.time').then(($time) => {
			const [endMinutes, endSeconds] = $time
				.text()
				.toString()
				.split(':')
				.map((str) => Number(str))
			cy.get('@startMinutes').then((startMinutes) => {
				cy.get('@startSeconds').then((startSeconds) => {
					expect(endSeconds + endMinutes * 60).to.be.lessThan(
						Number(startSeconds) + Number(startMinutes) * 60
					)
				})
			})
		})
	})

	it('persists between reloads', () => {
		cy.get('.time').then(($time) => {
			const [startMinutes, startSeconds] = $time.text().toString().split(':')
			cy.wrap(startSeconds).as('startSeconds')
			cy.wrap(startMinutes).as('startMinutes')
		})

		cy.getLocalStorage('bookingData').then((data) => {
			const bookingData: BookingData = JSON.parse(data)
			const mutated: BookingData = {
				...bookingData,
				exp: bookingData.exp - 5.2 * 60 * 1000,
			}
			cy.setLocalStorage('bookingData', JSON.stringify(mutated))
		})
		cy.reload()

		// Wait for localStora
		cy.wait(1000)

		cy.get('.time').then(($time) => {
			const [endMinutes, endSeconds] = $time
				.text()
				.toString()
				.split(':')
				.map((str) => Number(str))
			cy.get('@startMinutes').then((startMinutes) => {
				cy.get('@startSeconds').then((startSeconds) => {
					expect(endSeconds + endMinutes * 60).to.be.lessThan(
						Number(startSeconds) + Number(startMinutes) * 60
					)
				})
			})
		})
	})

	it('redirects to the hire page when opened after expiration', () => {
		cy.get('.time').then(($time) => {
			const [startMinutes, startSeconds] = $time.text().toString().split(':')
			cy.wrap(Number(startSeconds)).should('be.lessThan', 60)
			cy.wrap(Number(startMinutes)).should('equal', 9)
		})

		cy.getLocalStorage('bookingData').then((data) => {
			const bookingData: BookingData = JSON.parse(data)
			const mutated: BookingData = {
				...bookingData,
				exp: bookingData.exp - 10 * 60 * 1000,
			}
			cy.log(data)
			cy.setLocalStorage('bookingData', JSON.stringify(mutated))
		})
		cy.reload()

		cy.location('pathname', { timeout: 10000 }).should('eq', '/hire')
	})

	it('sends a request to delete booking on expiration', () => {
		cy.get('.time').then(($time) => {
			const [startMinutes, startSeconds] = $time.text().toString().split(':')
			cy.wrap(Number(startSeconds)).should('be.lessThan', 60)
			cy.wrap(Number(startMinutes)).should('equal', 9)
		})

		cy.getLocalStorage('bookingData').then((data) => {
			const bookingData: BookingData = JSON.parse(data)
			cy.wrap(bookingData.bookingID).as('bookingID')
			cy.intercept('DELETE', `/api/bookings/${bookingData.bookingID}`).as(
				'delete'
			)
			const mutated: BookingData = {
				...bookingData,
				exp: bookingData.exp - 10 * 60 * 1000,
			}
			cy.setLocalStorage('bookingData', JSON.stringify(mutated))
		})
		cy.reload()

		cy.wait('@delete').then((intercept) => {
			cy.get('@bookingID').then((bookingID) => {
				expect(intercept.request.url).to.contain(bookingID)
			})
		})
	})
})

afterEach(() => {
	cy.clearLocalStorage()
	cy.task('DBClear', { tableName: 'orders' })
	cy.task('DBClear', { tableName: 'bookings' })
})

after(() => {
	cy.task('cleanup')
})
