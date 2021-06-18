import {
	invalidCheckoutRequestNegativeTime,
	invalidCheckoutRequestPrice,
	invalidCheckoutRequestZeroTime,
	validCheckoutRequest,
} from '@fixtures/checkoutFixtures'
import handler from '@pages/api/checkout_sessions'
import { APIError } from '@typings/api/Error'
import { ConnectedRequest } from '@typings/api/Request'
import { NextApiResponse } from 'next'
import { createMocks } from 'node-mocks-http'
import Stripe from 'stripe'

const stripe: Stripe = new Stripe(process.env.STRIPE_SECRET, {
	apiVersion: '2020-08-27',
})

describe('post', () => {
	it('creates payment intent from valid input', async () => {
		const { req, res } = createMocks<
			ConnectedRequest,
			NextApiResponse<Stripe.Checkout.Session | APIError>
		>({
			headers: { origin: 'http://localhost:3000' },
			method: 'POST',
			body: validCheckoutRequest,
		})

		await handler(req, res)

		expect(res._getStatusCode()).toBe(200)
		const data: Stripe.Checkout.Session = JSON.parse(res._getData())
		expect(data).toEqual(
			expect.objectContaining({
				object: 'checkout.session',
				allow_promotion_codes: true,
				amount_subtotal: (validCheckoutRequest.price) * 100,
				cancel_url: `${req.headers.origin}/failure`,
				success_url:
					'http://localhost:3000/success?session_id={CHECKOUT_SESSION_ID}',
				currency: 'gbp',
				livemode: false,
			} as Stripe.Checkout.Session)
		)

		await stripe.paymentIntents.cancel(data.payment_intent.toString(), {
			cancellation_reason: 'abandoned',
		})
	})

	it('detects 0 time checkout', async () => {
		const { req, res } = createMocks<
			ConnectedRequest,
			NextApiResponse<Stripe.Checkout.Session | APIError>
		>({
			headers: { origin: 'http://localhost:3000' },
			method: 'POST',
			body: invalidCheckoutRequestZeroTime,
		})

		await handler(req, res)
		const data: APIError = JSON.parse(res._getData())
		expect(res._getStatusCode()).toBe(400)
		expect(data).toEqual(
			expect.objectContaining({
				type: 'RangeError',
			} as APIError)
		)
	})

	it('detects negative time checkout', async () => {
		const { req, res } = createMocks<
			ConnectedRequest,
			NextApiResponse<Stripe.Checkout.Session | APIError>
		>({
			headers: { origin: 'http://localhost:3000' },
			method: 'POST',
			body: invalidCheckoutRequestNegativeTime,
		})

		await handler(req, res)

		const data: APIError = JSON.parse(res._getData())
		expect(res._getStatusCode()).toBe(400)
		expect(data).toEqual(
			expect.objectContaining({
				type: 'RangeError',
			} as APIError)
		)
	})

	it('detects minimum price checkout', async () => {
		const { req, res } = createMocks<
			ConnectedRequest,
			NextApiResponse<Stripe.Checkout.Session | APIError>
		>({
			headers: { origin: 'http://localhost:3000' },
			method: 'POST',
			body: invalidCheckoutRequestPrice,
		})

		await handler(req, res)

		const data: APIError = JSON.parse(res._getData())
		expect(res._getStatusCode()).toBe(400)
		expect(data).toEqual(
			expect.objectContaining({
				type: 'RangeError',
			} as APIError)
		)
	})
})
