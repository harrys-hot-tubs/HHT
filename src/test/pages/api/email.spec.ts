import { completeAccount } from '@fixtures/accountFixtures'
import { cleanupDatabase, connection } from '@helpers/DBHelper'
import { prepareAccount } from '@pages/api/accounts/index'
import handler from '@pages/api/email'
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

describe('post', () => {
	describe('verify email', () => {
		it('detects strings which are not email addresses', async () => {
			const { req, res } = createMocks<
				ConnectedRequest,
				NextApiResponse<VerifyEmailResponse>
			>({
				method: 'POST',
				body: { validate: false, email: 'zxcvbn' } as VerifyEmailRequest,
			})

			await handler(req, res)

			expect(res._getStatusCode()).toBe(400)
			expect(JSON.parse(res._getData())).toHaveProperty('error', true)
		})

		it('detects email addresses that already exist', async () => {
			const preparedAccount = await prepareAccount(completeAccount)
			await connection<AccountDB>('accounts').insert({
				...preparedAccount,
				account_roles: ['driver'],
				confirmation_code: 'ABC123',
				confirmed: true,
			})

			const { req, res } = createMocks<
				ConnectedRequest,
				NextApiResponse<VerifyEmailResponse>
			>({
				method: 'POST',
				body: {
					validate: false,
					email: preparedAccount.email_address,
				} as VerifyEmailRequest,
			})

			await handler(req, res)

			expect(res._getStatusCode()).toBe(400)
			expect(JSON.parse(res._getData())).toHaveProperty('error', true)
		})

		it('sends confirmation codes to the specified email address', async () => {
			const { req, res } = createMocks<
				ConnectedRequest,
				NextApiResponse<VerifyEmailResponse>
			>({
				method: 'POST',
				body: {
					validate: false,
					email: completeAccount.emailAddress,
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
					.where('email_address', '=', completeAccount.emailAddress)

			expect(mailJetParams.Messages[0].To[0].Email).toBe(
				completeAccount.emailAddress
			)
			expect(mailJetParams.Messages[0].Subject).toBe('Your Confirmation Code')
			expect(mailJetParams.Messages[0].HTMLPart).toEqual(
				expect.stringContaining(confirmationCode)
			)
		})
	})

	describe('confirm confirmation code', () => {
		const confirmationCode = 'ABC123'
		beforeEach(async () => {
			await connection<AccountDB>('accounts').insert({
				email_address: completeAccount.emailAddress,
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
				body: {
					validate: true,
					email: completeAccount.emailAddress,
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
				body: {
					validate: true,
					email: completeAccount.emailAddress,
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
