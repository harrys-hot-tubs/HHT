import {
	adminAccount,
	driverAccount,
	managerAccount,
} from '@fixtures/accountFixtures'
import { expiredAccountToken, inDateAccountToken } from '@fixtures/authFixtures'
import { cleanupDatabase, connection } from '@helpers/DBHelper'
import handler, { DPO_EMAIL, formatAccount } from '@pages/api/accounts/[id]'
import { GetAccountResponse, PostAccountRequest } from '@typings/api/Accounts'
import { ConnectedRequest } from '@typings/api/Request'
import { AccountDB } from '@typings/db/Account'
import { NextApiResponse } from 'next'
import nock from 'nock'
import { Email } from 'node-mailjet'
import { createMocks } from 'node-mocks-http'

beforeEach(async () => {
	await connection<AccountDB>('accounts').insert({
		...driverAccount,
		// ! For some reason, this function cannot import confirmation code from the fixtures.
		confirmation_code: 'ABC123',
	})
})

describe('get', () => {
	it('fetches account information for the matching authorised account', async () => {
		const { req, res } = createMocks<ConnectedRequest, NextApiResponse>({
			method: 'GET',
			query: { id: driverAccount.account_id },
			cookies: {
				token: inDateAccountToken(driverAccount),
			},
		})

		await handler(req, res)

		expect(res._getStatusCode()).toBe(200)
		expect(JSON.parse(res._getData())).toEqual({
			error: false,
			account: { ...formatAccount(driverAccount), account_roles: '{driver}' },
		})
	})

	it('fetches no account information for an unauthorised account', async () => {
		const { req, res } = createMocks<ConnectedRequest, NextApiResponse>({
			method: 'GET',
			query: { id: driverAccount.account_id },
			cookies: {
				token: inDateAccountToken(managerAccount),
			},
		})

		await handler(req, res)

		expect(res._getStatusCode()).toBe(401)
		console.log(res._getData())
		expect(JSON.parse(res._getData())).toEqual<GetAccountResponse>(
			expect.objectContaining({
				error: true,
			})
		)
	})

	it('fetches no account information for the matching unauthorised account', async () => {
		const { req, res } = createMocks<ConnectedRequest, NextApiResponse>({
			method: 'GET',
			query: { id: driverAccount.account_id },
			cookies: {
				token: expiredAccountToken(driverAccount),
			},
		})

		await handler(req, res)

		expect(res._getStatusCode()).toBe(401)
		console.log(res._getData())

		expect(JSON.parse(res._getData())).toEqual<GetAccountResponse>(
			expect.objectContaining({
				error: true,
			})
		)
	})

	it('fetches account information on any account for an authorised admin', async () => {
		await connection<AccountDB>('accounts').insert(adminAccount)
		const { req, res } = createMocks<ConnectedRequest, NextApiResponse>({
			method: 'GET',
			query: { id: driverAccount.account_id },
			cookies: {
				token: inDateAccountToken(adminAccount),
			},
		})

		await handler(req, res)

		expect(res._getStatusCode()).toBe(200)
		expect(JSON.parse(res._getData())).toEqual({
			error: false,
			account: { ...formatAccount(driverAccount), account_roles: '{driver}' },
		})
	})
})

describe('post', () => {
	let mailJetParams: Email.SendParams

	const mailJetServerEndpoint = 'https://api.mailjet.com/v3.1'
	beforeAll(() => {
		nock(mailJetServerEndpoint)
			.persist()
			.post('/send')
			.reply(200, (_uri, requestBody) => {
				mailJetParams = requestBody as Email.SendParams
				return {}
			})
	})

	it('returns an error on an invalid request', async () => {
		const { req, res } = createMocks<ConnectedRequest, NextApiResponse>({
			method: 'POST',
			query: { id: driverAccount.account_id },
			body: { type: 'NULL' },
			cookies: {
				token: inDateAccountToken(driverAccount),
			},
		})

		await handler(req, res)

		expect(res._getStatusCode()).toBe(400)
		expect(JSON.parse(res._getData())).toEqual(
			expect.objectContaining({
				error: true,
			})
		)
	})

	describe('GDPR request', () => {
		it('sends notification emails to the user and the data protection officer', async () => {
			const { req, res } = createMocks<ConnectedRequest, NextApiResponse>({
				method: 'POST',
				query: { id: driverAccount.account_id },
				body: { type: 'GDPR' } as PostAccountRequest,
				cookies: {
					token: inDateAccountToken(driverAccount),
				},
			})

			await handler(req, res)

			expect(res._getStatusCode()).toBe(200)
			expect(JSON.parse(res._getData())).toEqual({ error: false, sent: true })
			expect(mailJetParams.Messages[0].To[0].Email).toBe(DPO_EMAIL)
			expect(mailJetParams.Messages[1].To[0].Email).toBe(
				driverAccount.email_address
			)
		})

		it("updates the user's account to include the active information request", async () => {
			const { req, res } = createMocks<ConnectedRequest, NextApiResponse>({
				method: 'POST',
				query: { id: driverAccount.account_id },
				body: { type: 'GDPR' } as PostAccountRequest,
				cookies: {
					token: inDateAccountToken(driverAccount),
				},
			})

			await handler(req, res)

			const account = await connection<AccountDB>('accounts')
				.select()
				.where('account_id', '=', driverAccount.account_id)
				.first()

			expect(account).toHaveProperty<AccountDB['active_information_request']>(
				'active_information_request',
				true
			)
		})

		it('returns an error if the requesting user is not authorised', async () => {
			const { req, res } = createMocks<ConnectedRequest, NextApiResponse>({
				method: 'POST',
				query: { id: driverAccount.account_id },
				body: { type: 'GDPR' } as PostAccountRequest,
				cookies: {
					token: expiredAccountToken(driverAccount),
				},
			})

			await handler(req, res)

			expect(res._getStatusCode()).toBe(401)
			expect(JSON.parse(res._getData())).toEqual(
				expect.objectContaining({
					error: true,
				})
			)
		})

		afterAll(() => {
			nock.cleanAll()
		})
	})
})

describe('delete', () => {
	it('deletes the account of an authorised user', async () => {
		const { req, res } = createMocks<ConnectedRequest, NextApiResponse>({
			method: 'DELETE',
			query: { id: driverAccount.account_id },
			cookies: {
				token: inDateAccountToken(driverAccount),
			},
		})

		await handler(req, res)

		expect(res._getStatusCode()).toBe(200)
		expect(JSON.parse(res._getData())).toEqual({
			error: false,
			deleted: true,
		})

		const accountIDs = (
			await connection<AccountDB>('accounts').select('account_id')
		).map((account) => account.account_id)
		expect(accountIDs).not.toContain(driverAccount.account_id)
	})

	it('does not delete the account of an unauthorised user', async () => {
		const { req, res } = createMocks<ConnectedRequest, NextApiResponse>({
			method: 'DELETE',
			query: { id: driverAccount.account_id },
			cookies: {
				token: expiredAccountToken(driverAccount),
			},
		})

		await handler(req, res)

		expect(res._getStatusCode()).toBe(401)
		expect(JSON.parse(res._getData())).toEqual(
			expect.objectContaining({
				error: true,
			})
		)

		const accountIDs = (
			await connection<AccountDB>('accounts').select('account_id')
		).map((account) => account.account_id)
		expect(accountIDs).toContain(driverAccount.account_id)
	})
})

afterEach(async () => {
	await connection<AccountDB>('accounts').del()
})

afterAll(async () => {
	await cleanupDatabase(connection)
})
