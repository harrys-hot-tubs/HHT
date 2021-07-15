import { locations } from '@fixtures/locationFixtures'
import {
	invalidPaymentIntentRequestTubID,
	invalidPaymentIntentRequestZeroPrice,
	invalidPaymentIntentRequestZeroTime,
	validPaymentIntentRequest
} from '@fixtures/paymentFixtures'
import { tubs } from '@fixtures/tubFixtures'
import { cleanupDatabase, connection } from '@helpers/DBHelper'
import handler from '@pages/api/payments'
import { ConnectedRequest } from '@typings/api'
import { APIError } from '@typings/api/Error'
import { LocationDB } from '@typings/db/Location'
import { TubDB } from '@typings/db/Tub'
import { NextApiResponse } from 'next'
import { createMocks } from 'node-mocks-http'
import Stripe from 'stripe'

const stripe: Stripe = new Stripe(process.env.STRIPE_SECRET, {
	apiVersion: '2020-08-27',
})

beforeAll(async () => {
	await connection<LocationDB>('locations').insert(locations)
	await connection<TubDB>('tubs').insert(tubs)
})

describe('post', () => {
	it('creates payment intent from valid input', async () => {
		const { req, res } = createMocks<
			ConnectedRequest,
			NextApiResponse<
				Pick<Stripe.PaymentIntent, 'client_secret' | 'id'> | APIError
			>
		>({
			headers: { origin: 'http://localhost:3000' },
			method: 'POST',
			body: validPaymentIntentRequest,
		})

		await handler(req, res)

		expect(res._getStatusCode()).toBe(200)
		const data: Pick<Stripe.PaymentIntent, 'client_secret' | 'id'> = JSON.parse(
			res._getData()
		)
		expect(data).toEqual(
			expect.objectContaining({
				client_secret: expect.stringContaining('secret'),
				id: expect.stringContaining('pi'),
			} as Pick<Stripe.PaymentIntent, 'client_secret' | 'id'>)
		)

		await stripe.paymentIntents.cancel(data.id)
	})

	it('detects 0 time payment intent request', async () => {
		const { req, res } = createMocks<
			ConnectedRequest,
			NextApiResponse<Stripe.Checkout.Session | APIError>
		>({
			headers: { origin: 'http://localhost:3000' },
			method: 'POST',
			body: invalidPaymentIntentRequestZeroTime,
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

	it('detects negative time payment intent request', async () => {
		const { req, res } = createMocks<
			ConnectedRequest,
			NextApiResponse<Stripe.Checkout.Session | APIError>
		>({
			headers: { origin: 'http://localhost:3000' },
			method: 'POST',
			body: invalidPaymentIntentRequestZeroPrice,
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

	it('detects non existent tubs', async () => {
		const { req, res } = createMocks<
			ConnectedRequest,
			NextApiResponse<Stripe.Checkout.Session | APIError>
		>({
			headers: { origin: 'http://localhost:3000' },
			method: 'POST',
			body: invalidPaymentIntentRequestTubID,
		})

		await handler(req, res)

		const data: APIError = JSON.parse(res._getData())
		expect(res._getStatusCode()).toBe(400)
		expect(data).toEqual(
			expect.objectContaining({
				type: 'ReferenceError',
			} as APIError)
		)
	})

	it('detects a tub with a price below the minimum', async () => {
		const { req, res } = createMocks<
			ConnectedRequest,
			NextApiResponse<Stripe.Checkout.Session | APIError>
		>({
			headers: { origin: 'http://localhost:3000' },
			method: 'POST',
			body: invalidPaymentIntentRequestZeroPrice,
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

describe('patch', () => {
	// TODO add tests.
})

afterAll(async () => {
	await cleanupDatabase(connection)
})
