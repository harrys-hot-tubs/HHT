import { driverAccount, managerAccount } from '@fixtures/accountFixtures'
import { cleanupDatabase, connection } from '@helpers/DBHelper'
import handler from '@pages/api/accounts/reset'
import {
	ValidateConfirmationCodeRequest,
	ValidateConfirmationCodeResponse,
	VerifyEmailRequest,
	VerifyEmailResponse,
} from '@typings/api/Email'
import { ConnectedRequest } from '@typings/api/index'
import { AccountDB } from '@typings/db/Account'
import { NextApiResponse } from 'next'
import nock from 'nock'
import { Email } from 'node-mailjet'
import { createMocks } from 'node-mocks-http'
import {
	ResetPasswordRequest,
	ResetPasswordResponse,
} from '../../../../typings/api/Accounts'

let mailJetParams: Email.SendParams

const mailJetServerEndpoint = 'https://api.mailjet.com/v3.1'
beforeAll(async () => {
	nock(mailJetServerEndpoint)
		.persist()
		.post('/send')
		.reply(200, (_uri, requestBody) => {
			mailJetParams = requestBody as Email.SendParams
			return {}
		})

	await connection<AccountDB>('accounts').insert(driverAccount)
})

describe('post', () => {
	describe('verifyEmail', () => {
		it('rejects email address that are not valid', async () => {
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

		it('rejects email addresses for accounts that do not exist', async () => {
			const { req, res } = createMocks<
				ConnectedRequest,
				NextApiResponse<VerifyEmailResponse>
			>({
				method: 'POST',
				body: {
					validate: false,
					email: managerAccount.email_address,
				} as VerifyEmailRequest,
			})

			await handler(req, res)

			expect(res._getStatusCode()).toBe(400)
			expect(JSON.parse(res._getData())).toHaveProperty('error', true)
		})

		it('sends an email with a confirmation code to the user', async () => {
			const { req, res } = createMocks<
				ConnectedRequest,
				NextApiResponse<VerifyEmailResponse>
			>({
				method: 'POST',
				body: {
					validate: false,
					email: driverAccount.email_address,
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
					.where('email_address', '=', driverAccount.email_address)

			expect(mailJetParams.Messages[0].To[0].Email).toBe(
				driverAccount.email_address
			)
			expect(mailJetParams.Messages[0].Subject).toBe('Your Confirmation Code')
			expect(mailJetParams.Messages[0].HTMLPart).toEqual(
				expect.stringContaining(confirmationCode)
			)
		})
	})

	describe('confirmCode', () => {
		beforeEach(async () => {
			await connection<AccountDB>('accounts').del()
			await connection<AccountDB>('accounts').insert(driverAccount)
		})

		it('returns valid for a valid code', async () => {
			const { req, res } = createMocks<
				ConnectedRequest,
				NextApiResponse<ValidateConfirmationCodeResponse>
			>({
				method: 'POST',
				body: {
					validate: true,
					email: driverAccount.email_address,
					confirmationCode: driverAccount.confirmation_code,
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
					email: driverAccount.email_address,
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
})

describe('patch', () => {
	it('updates the account of the user matching the email address and confirmation code', async () => {
		const { req, res } = createMocks<ConnectedRequest, NextApiResponse>({
			method: 'PATCH',
			body: {
				email: driverAccount.email_address,
				confirmationCode: driverAccount.confirmation_code,
				password: 'NewPassword',
			} as ResetPasswordRequest,
		})

		await handler(req, res)

		expect(res._getStatusCode()).toBe(200)
		expect(JSON.parse(res._getData())).toEqual<ResetPasswordResponse>({
			error: false,
			reset: true,
		})

		const newPasswordHash: string = await connection<AccountDB>('accounts')
			.select('password_hash')
			.where('account_id', '=', driverAccount.account_id)
			.first()

		expect(newPasswordHash).not.toEqual(driverAccount.password_hash)
	})

	it('does not update the account of the user without a matching email address and confirmation code', async () => {
		const { req, res } = createMocks<ConnectedRequest, NextApiResponse>({
			method: 'PATCH',
			body: {
				email: driverAccount.email_address,
				confirmationCode: 'zxcvbn',
				password: 'NewPasword',
			} as ResetPasswordRequest,
		})

		await handler(req, res)

		expect(res._getStatusCode()).toBe(200)
		expect(JSON.parse(res._getData())).toEqual(
			expect.objectContaining({
				error: false,
				reset: false,
			})
		)
	})
})

afterAll(async () => {
	await cleanupDatabase(connection)
	nock.cleanAll()
})
