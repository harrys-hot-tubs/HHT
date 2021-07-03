import { adminAccount, driverAccount } from '@fixtures/accountFixtures'
import { expiredAccountToken, inDateAccountToken } from '@fixtures/authFixtures'
import { cleanupDatabase, connection } from '@helpers/DBHelper'
import handler from '@pages/api/email/[id]'
import { ConnectedRequest } from '@typings/api'
import {
	ValidateConfirmationCodeRequest,
	ValidateConfirmationCodeResponse,
	VerifyEmailRequest,
	VerifyEmailResponse,
} from '@typings/api/Email'
import { AccountDB } from '@typings/db/Account'
import { NextApiResponse } from 'next'
import nock from 'nock'
import { Email } from 'node-mailjet'
import { createMocks } from 'node-mocks-http'

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

beforeEach(async () => {
	await connection<AccountDB>('accounts').insert([driverAccount, adminAccount])
})

describe('post', () => {
	it('rejects unauthorised users', async () => {
		const { req, res } = createMocks<
			ConnectedRequest,
			NextApiResponse<VerifyEmailResponse>
		>({
			method: 'POST',
			cookies: {
				token: expiredAccountToken(driverAccount),
			},
			query: { id: driverAccount.account_id },
			body: { validate: false, email: 'zxcvbn' } as VerifyEmailRequest,
		})

		await handler(req, res)

		expect(res._getStatusCode()).toBe(401)
	})

	describe('verify email', () => {
		it('detects strings which are not email addresses', async () => {
			const { req, res } = createMocks<
				ConnectedRequest,
				NextApiResponse<VerifyEmailResponse>
			>({
				method: 'POST',
				cookies: {
					token: inDateAccountToken(driverAccount),
				},
				query: { id: driverAccount.account_id },
				body: { validate: false, email: 'zxcvbn' } as VerifyEmailRequest,
			})

			await handler(req, res)

			expect(res._getStatusCode()).toBe(400)
			expect(JSON.parse(res._getData())).toHaveProperty('error', true)
		})

		it('detects email addresses that already exist', async () => {
			const { req, res } = createMocks<
				ConnectedRequest,
				NextApiResponse<VerifyEmailResponse>
			>({
				method: 'POST',
				cookies: {
					token: inDateAccountToken(driverAccount),
				},
				query: { id: driverAccount.account_id },
				body: {
					validate: false,
					email: adminAccount.email_address,
				} as VerifyEmailRequest,
			})

			await handler(req, res)

			expect(res._getStatusCode()).toBe(400)
			expect(JSON.parse(res._getData())).toHaveProperty('error', true)
		})

		it('sends confirmation codes to the specified email address', async () => {
			const newAddress = 'a@gmail.com'

			const { req, res } = createMocks<
				ConnectedRequest,
				NextApiResponse<VerifyEmailResponse>
			>({
				method: 'POST',
				cookies: {
					token: inDateAccountToken(driverAccount),
				},
				query: { id: driverAccount.account_id },
				body: {
					validate: false,
					email: newAddress,
				} as VerifyEmailRequest,
			})

			await handler(req, res)

			expect(res._getStatusCode()).toBe(200)
			expect(JSON.parse(res._getData())).toEqual(
				expect.objectContaining<VerifyEmailResponse>({
					error: false,
					inserted: true,
				})
			)

			const { confirmation_code: confirmationCode } =
				await connection<AccountDB>('accounts')
					.select('confirmation_code')
					.first()
					.where('account_id', '=', driverAccount.account_id)

			expect(mailJetParams.Messages[0].To[0].Email).toBe(newAddress)
			expect(mailJetParams.Messages[0].Subject).toBe('Your Confirmation Code')
			expect(mailJetParams.Messages[0].HTMLPart).toEqual(
				expect.stringContaining(confirmationCode)
			)
		})
	})

	describe('confirm confirmation code', () => {
		const confirmationCode = 'ABC123'
		beforeEach(async () => {
			await connection<AccountDB>('accounts').del()
			await connection<AccountDB>('accounts').insert({
				...driverAccount,
				confirmation_code: confirmationCode,
				confirmed: false,
			})
		})

		it('returns valid for a valid code', async () => {
			const { req, res } = createMocks<
				ConnectedRequest,
				NextApiResponse<ValidateConfirmationCodeResponse>
			>({
				method: 'POST',
				cookies: {
					token: inDateAccountToken(driverAccount),
				},
				query: { id: driverAccount.account_id },
				body: {
					validate: true,
					confirmationCode: confirmationCode,
				} as ValidateConfirmationCodeRequest,
			})

			await handler(req, res)

			expect(res._getStatusCode()).toBe(200)
			expect(JSON.parse(res._getData())).toEqual(
				expect.objectContaining<ValidateConfirmationCodeResponse>({
					error: false,
					valid: true,
				})
			)
		})

		it('returns invalid for an invalid code', async () => {
			const { req, res } = createMocks<
				ConnectedRequest,
				NextApiResponse<ValidateConfirmationCodeResponse>
			>({
				method: 'POST',
				cookies: {
					token: inDateAccountToken(driverAccount),
				},
				query: { id: driverAccount.account_id },
				body: {
					validate: true,
					confirmationCode: 'zxcvbn',
				} as ValidateConfirmationCodeRequest,
			})

			await handler(req, res)

			expect(res._getStatusCode()).toBe(200)
			expect(JSON.parse(res._getData())).toEqual(
				expect.objectContaining<ValidateConfirmationCodeResponse>({
					error: false,
					valid: false,
				})
			)
		})
	})

	afterEach(async () => {
		await connection<AccountDB>('accounts').del()
	})
})

afterAll(async () => {
	await cleanupDatabase(connection)
	nock.cleanAll()
})
