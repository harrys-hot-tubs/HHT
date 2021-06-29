import { driverAccount, managerAccount } from '@fixtures/accountFixtures'
import { expiredAccountToken, inDateAccountToken } from '@fixtures/authFixtures'
import { bookings } from '@fixtures/bookingFixtures'
import { locations } from '@fixtures/locationFixtures'
import { storedOrder } from '@fixtures/orderFixtures'
import { refunds } from '@fixtures/refundFixtures'
import { tubs } from '@fixtures/tubFixtures'
import { cleanupDatabase, connection } from '@helpers/DBHelper'
import handler from '@pages/api/refunds/[id]'
import { ConnectedRequest } from '@typings/api'
import { AccountDB } from '@typings/db/Account'
import { BookingDB } from '@typings/db/Booking'
import { LocationDB } from '@typings/db/Location'
import { OrderDB } from '@typings/db/Order'
import { RefundDB } from '@typings/db/Refund'
import { TubDB } from '@typings/db/Tub'
import { NextApiResponse } from 'next'
import { createMocks } from 'node-mocks-http'

beforeAll(async () => {
	await connection<AccountDB[]>('accounts').insert([
		driverAccount,
		managerAccount,
	])
	await connection<LocationDB[]>('locations').insert(locations)
	await connection<TubDB[]>('tubs').insert(tubs)
	await connection<BookingDB[]>('bookings').insert(bookings)
	await connection<OrderDB[]>('orders').insert([storedOrder])
})

describe('post', () => {
	it('accepts authorised requests', async () => {
		const { req, res } = createMocks<ConnectedRequest, NextApiResponse>({
			method: 'POST',
			query: { id: refunds[0].order_id },
			cookies: {
				token: inDateAccountToken(driverAccount),
			},
			body: { damaged: false, settled: false, damage_information: '' } as Omit<
				RefundDB,
				'account_id' | 'order_id'
			>,
		})
		await handler(req, res)
		expect(res._getStatusCode()).toBe(200)
	})

	it('rejects unauthorised requests', async () => {
		const { req, res } = createMocks<ConnectedRequest, NextApiResponse>({
			method: 'POST',
			query: { id: refunds[0].order_id },
			cookies: {
				token: expiredAccountToken(driverAccount),
			},
			body: { damaged: false, settled: false, damage_information: '' } as Omit<
				RefundDB,
				'account_id' | 'order_id'
			>,
		})
		await handler(req, res)
		expect(res._getStatusCode()).toBe(401)
	})

	it('returns the inserted refund on success', async () => {
		const { req, res } = createMocks<ConnectedRequest, NextApiResponse>({
			method: 'POST',
			query: { id: refunds[0].order_id },
			cookies: {
				token: inDateAccountToken(driverAccount),
			},
			body: { damaged: false, settled: false, damage_information: '' } as Omit<
				RefundDB,
				'account_id' | 'order_id'
			>,
		})
		await handler(req, res)
		expect(res._getStatusCode()).toBe(200)
		expect(JSON.parse(res._getData())).toEqual<{ inserted: RefundDB[] }>({
			inserted: [refunds[0]],
		})
	})

	it('returns an error for duplicate inserts', async () => {
		await connection<RefundDB[]>('refunds').insert(refunds)

		const { req, res } = createMocks<ConnectedRequest, NextApiResponse>({
			method: 'POST',
			query: { id: refunds[0].order_id },
			cookies: {
				token: inDateAccountToken(driverAccount),
			},
			body: { damaged: false, settled: false, damage_information: '' } as Omit<
				RefundDB,
				'account_id' | 'order_id'
			>,
		})
		await handler(req, res)
		expect(res._getStatusCode()).toBe(500)
	})

	it('returns the updated refund on success', async () => {
		await connection<RefundDB[]>('refunds').insert(refunds)

		const { req, res } = createMocks<ConnectedRequest, NextApiResponse>({
			method: 'POST',
			query: { id: refunds[0].order_id },
			cookies: {
				token: inDateAccountToken(managerAccount),
			},
			body: { settled: true } as Pick<RefundDB, 'settled'>,
		})
		await handler(req, res)
		expect(res._getStatusCode()).toBe(200)
		expect(JSON.parse(res._getData())).toEqual<{ updated: RefundDB[] }>({
			updated: [
				{ ...refunds[0], settled: true, account_id: managerAccount.account_id },
			],
		})
	})

	it('returns no tubs when attempting to update a non-existent tub', async () => {
		const { req, res } = createMocks<ConnectedRequest, NextApiResponse>({
			method: 'POST',
			query: { id: refunds[0].order_id },
			cookies: {
				token: inDateAccountToken(managerAccount),
			},
			body: { settled: true } as Pick<RefundDB, 'settled'>,
		})
		await handler(req, res)
		expect(res._getStatusCode()).toBe(200)
		expect(JSON.parse(res._getData())).toEqual<{ updated: RefundDB[] }>({
			updated: [],
		})
	})
})

describe('delete', () => {
	it('accepts authorised requests', async () => {
		const { req, res } = createMocks<ConnectedRequest, NextApiResponse>({
			method: 'DELETE',
			query: { id: refunds[0].order_id },
			cookies: {
				token: inDateAccountToken(driverAccount),
			},
		})
		await handler(req, res)
		expect(res._getStatusCode()).toBe(200)
	})

	it('rejects outdated requests', async () => {
		const { req, res } = createMocks<ConnectedRequest, NextApiResponse>({
			method: 'DELETE',
			query: { id: refunds[0].order_id },
			cookies: {
				token: expiredAccountToken(driverAccount),
			},
		})
		await handler(req, res)
		expect(res._getStatusCode()).toBe(401)
	})

	it('rejects unauthorised requests', async () => {
		const { req, res } = createMocks<ConnectedRequest, NextApiResponse>({
			method: 'DELETE',
			query: { id: refunds[0].order_id },
			cookies: {
				token: inDateAccountToken(managerAccount),
			},
		})
		await handler(req, res)
		expect(res._getStatusCode()).toBe(401)
	})

	it('returns no tubs when attempting to delete an non-existent refund', async () => {
		const { req, res } = createMocks<ConnectedRequest, NextApiResponse>({
			method: 'DELETE',
			query: { id: refunds[0].order_id },
			cookies: {
				token: inDateAccountToken(driverAccount),
			},
		})
		await handler(req, res)
		expect(res._getStatusCode()).toBe(200)
		expect(JSON.parse(res._getData())).toEqual<{ removed: RefundDB[] }>({
			removed: [],
		})
	})

	it('returns tubs when successfully deleting a refund', async () => {
		await connection<RefundDB[]>('refunds').insert(refunds)

		const { req, res } = createMocks<ConnectedRequest, NextApiResponse>({
			method: 'DELETE',
			query: { id: refunds[0].order_id },
			cookies: {
				token: inDateAccountToken(driverAccount),
			},
		})
		await handler(req, res)
		expect(res._getStatusCode()).toBe(200)
		expect(JSON.parse(res._getData())).toEqual<{ removed: RefundDB[] }>({
			removed: [refunds[0]],
		})
	})
})

afterEach(async () => {
	await connection<RefundDB>('refunds').del()
})

afterAll(async () => {
	await cleanupDatabase(connection)
})
