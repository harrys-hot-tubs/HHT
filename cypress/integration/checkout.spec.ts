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
	cy.clearLocalStorage()
	cy.intercept('POST', `/api/tubs/${bookings[0].tub_id}`).as('getPrice')
	cy.intercept('POST', `/api/payments`).as('createPaymentIntent')

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
	cy.wait('@getPrice')
	cy.wait('@createPaymentIntent')
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
		cy.get('.form-group').should('have.length', 13)
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

		cy.get('.checkout-button').should('not.be.disabled').click()

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
		cy.intercept('POST', '/api/orders').as('createOrder')

		cy.get('.time').should('be.visible')
		cy.fillElementsInput('cardNumber', '4000000000000002')
		cy.fillElementsInput('cardExpiry', '1225')
		cy.fillElementsInput('cardCvc', '123')
		cy.get('.checkout-button', { timeout: 5000 })
			.should('not.be.disabled')
			.click()

		cy.wait('@createOrder')

		cy.get('[data-testid=payment-alert]').should('be.visible')
		cy.get('[data-testid=payment-alert-heading]')
			.should('be.visible')
			.should('contain.text', 'Payment Failed')
		cy.get('[data-testid=payment-alert-message]').should('be.visible')
	})

	it('shows error messages on validation_error', () => {
		cy.intercept('POST', '/api/orders').as('createOrder')

		cy.get('.time').should('be.visible')
		cy.fillElementsInput('cardNumber', '4000000000000069')
		cy.fillElementsInput('cardExpiry', '1225')
		cy.fillElementsInput('cardCvc', '123')
		cy.get('.checkout-button', { timeout: 5000 })
			.should('not.be.disabled')
			.click()

		cy.wait('@createOrder')

		cy.get('[data-testid=payment-alert]').should('be.visible')
		cy.get('[data-testid=payment-alert-heading]')
			.should('be.visible')
			.should('contain.text', 'Payment Failed')
		cy.get('[data-testid=payment-alert-message]').should('be.visible')
	})

	it('shows error messages on api_error', () => {
		cy.intercept('POST', '/api/orders').as('createOrder')

		cy.get('.time').should('be.visible')
		cy.fillElementsInput('cardNumber', '4000000000000119')
		cy.fillElementsInput('cardExpiry', '1225')
		cy.fillElementsInput('cardCvc', '123')
		cy.get('.checkout-button', { timeout: 5000 })
			.should('not.be.disabled')
			.click()

		cy.wait('@createOrder')

		cy.get('[data-testid=payment-alert]').should('be.visible')
		cy.get('[data-testid=payment-alert-heading]')
			.should('be.visible')
			.should('contain.text', 'Payment Failed')
		cy.get('[data-testid=payment-alert-message]').should('be.visible')
	})

	it('shows error messages on authentication_error', () => {
		cy.intercept('POST', '/api/orders').as('createOrder')

		cy.get('.time').should('be.visible')
		cy.fillElementsInput('cardNumber', '4000002760003184')
		cy.fillElementsInput('cardExpiry', '1225')
		cy.fillElementsInput('cardCvc', '123')
		cy.get('.checkout-button', { timeout: 5000 })
			.should('not.be.disabled')
			.click()

		cy.wait('@createOrder')

		// cy.contains('Fail Authentication').click()
		// TODO find out how to click the fail authentication button.
	})

	it('redirects to the success page on a successful checkout', () => {
		cy.intercept('POST', '/api/orders').as('createOrder')

		cy.get('.time').should('be.visible')
		cy.fillElementsInput('cardNumber', '4242424242424242')
		cy.fillElementsInput('cardExpiry', '1225')
		cy.fillElementsInput('cardCvc', '123')
		cy.get('.checkout-button', { timeout: 5000 })
			.should('not.be.disabled')
			.click()

		cy.wait('@createOrder')

		cy.location('pathname').should('eq', '/success')
	})
})

describe('discount code field', () => {
	it('displays an error message if a discount code does not exist', () => {
		const promoCode = '3551456497'
		cy.get('.time').should('be.visible')
		cy.get('[aria-label=discount-code]').should('be.visible').type(promoCode)
		cy.get('[data-testid=apply-discount-code-button]')
			.should('be.visible')
			.click()

		cy.get('#discount-code-feedback')
			.should('be.visible')
			.should('have.text', `Discount code ${promoCode} does not exist.`)
	})

	it('displays an error message if a discount code is inactive', () => {
		const promoCode = 'TEST'
		cy.get('.time').should('be.visible')
		cy.get('[aria-label=discount-code]').should('be.visible').type(promoCode)
		cy.get('[data-testid=apply-discount-code-button]')
			.should('be.visible')
			.click()

		cy.get('#discount-code-feedback')
			.should('be.visible')
			.should('have.text', `${promoCode} is not an active discount code.`)
	})

	it('reduces the price shown when a valid discount code is applied', () => {
		const promoCode = 'TEST2020'
		cy.get('.time').should('be.visible')
		cy.get('[aria-label=discount-code]').should('be.visible').type(promoCode)
		cy.get('[data-testid=apply-discount-code-button]')
			.should('be.visible')
			.click()

		cy.get('#discount-code-feedback')
			.should('be.visible')
			.should('have.text', `Discount code ${promoCode} applied.`)
		cy.get('[data-testid=price]')
			.should('be.visible')
			.should('contain.text', '74.50')
	})

	it('does not allow the same discount code to be applied twice', () => {
		const promoCode = 'TEST2020'
		cy.get('.time').should('be.visible')
		cy.get('[aria-label=discount-code]').should('be.visible').type(promoCode)
		cy.get('[data-testid=apply-discount-code-button]')
			.as('applyButton')
			.should('be.visible')
			.click()

		cy.get('#discount-code-feedback')
			.as('feedback')
			.should('be.visible')
			.should('have.text', `Discount code ${promoCode} applied.`)
		cy.get('[data-testid=price]')
			.should('be.visible')
			.should('contain.text', '74.50')

		cy.get('@applyButton').click()
		cy.get('@feedback').should(
			'have.text',
			`Discount code ${promoCode} already applied.`
		)
	})

	it('allows the discount code to be changed', () => {
		const firstPromoCode = 'TEST2020'
		const secondPromoCode = 'TEST2021'

		cy.get('.time').should('be.visible')
		cy.get('[aria-label=discount-code]')
			.as('discountCodeField')
			.should('be.visible')
			.type(firstPromoCode)
		cy.get('[data-testid=apply-discount-code-button]')
			.as('applyButton')
			.should('be.visible')
			.click()

		cy.get('#discount-code-feedback')
			.as('feedback')
			.should('be.visible')
			.should('have.text', `Discount code ${firstPromoCode} applied.`)
		cy.get('[data-testid=price]')
			.as('price')
			.should('be.visible')
			.should('contain.text', '74.50')

		cy.get('@discountCodeField').clear().type(secondPromoCode)
		cy.get('@applyButton').click()
		cy.get('@feedback').should(
			'have.text',
			`Discount code ${secondPromoCode} applied.`
		)
		cy.get('@price').should('contain.text', '139.00')
	})

	it('persists a discounted price between reloads', () => {
		const promoCode = 'TEST2020'
		cy.get('.time').should('be.visible')
		cy.get('[aria-label=discount-code]').should('be.visible').type(promoCode)
		cy.get('[data-testid=apply-discount-code-button]')
			.should('be.visible')
			.click()

		cy.get('#discount-code-feedback')
			.should('be.visible')
			.should('have.text', `Discount code ${promoCode} applied.`)
		cy.get('[data-testid=price]')
			.should('be.visible')
			.should('contain.text', '74.50')

		cy.reload()
		cy.get('[data-testid=price]')
			.should('be.visible')
			.should('contain.text', '74.50')
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

		// Wait for localStorage
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

	it('regenerates booking if possible when opened after expiration', () => {
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
			cy.intercept('DELETE', `/api/bookings/${bookingData.bookingID}`).as(
				'delete'
			)
		})
		cy.reload()
		cy.wait('@delete')

		cy.location('pathname').should('eq', '/checkout')
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
