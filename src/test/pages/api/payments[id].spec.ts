import handler from '@pages/api/payments/[id]'
import { APIErrorResponse } from '@typings/api/Error'
import { ConnectedRequest } from '@typings/api/index'
import { NextApiResponse } from 'next'
import { createMocks } from 'node-mocks-http'
import Stripe from 'stripe'

const stripe: Stripe = new Stripe(process.env.STRIPE_SECRET, {
	apiVersion: '2020-08-27',
})

describe('get', () => {
	it('returns the amount and metadata for an existing payment intent', async () => {
		const intent = await stripe.paymentIntents.create({
			amount: 1000,
			currency: 'gbp',
			metadata: {
				foo: 'bar',
			},
		})

		const paymentIntentID = intent.id

		const { req, res } = createMocks<
			ConnectedRequest,
			NextApiResponse<
				Pick<Stripe.PaymentIntent, 'metadata' | 'amount'> | APIErrorResponse
			>
		>({
			method: 'GET',
			query: {
				id: paymentIntentID,
			},
		})

		await handler(req, res)
		expect(res._getStatusCode()).toBe(200)
		expect(JSON.parse(res._getData())).toEqual({
			amount: 1000,
			metadata: {
				foo: 'bar',
			},
		})

		await stripe.paymentIntents.cancel(paymentIntentID)
	})

	it('returns an error if the payment intent does not exist', async () => {
		const { req, res } = createMocks<
			ConnectedRequest,
			NextApiResponse<
				Pick<Stripe.PaymentIntent, 'metadata' | 'amount'> | APIErrorResponse
			>
		>({
			method: 'GET',
			query: {
				id: undefined,
			},
		})

		await handler(req, res)
		expect(res._getStatusCode()).toBe(400)
		expect(JSON.parse(res._getData())).toEqual(
			expect.objectContaining({
				type: 'NotFoundError',
			})
		)
	})
})
