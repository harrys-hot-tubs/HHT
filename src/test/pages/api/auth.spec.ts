import { completeAccount } from '@fixtures/accountFixtures'
import { cleanupDatabase, connection } from '@helpers/DBHelper'
import { prepareAccount } from '@pages/api/accounts'
import handler from '@pages/api/auth'
import { ConnectedRequest } from '@typings/api'
import { AccountDB } from '@typings/db/Account'
import jwt from 'jsonwebtoken'
import { NextApiResponse } from 'next'
import { createMocks } from 'node-mocks-http'

beforeAll(async () => {
	const preparedAccount = await prepareAccount(completeAccount)
	await connection<AccountDB>('accounts').insert({
		...preparedAccount,
		account_roles: ['driver'],
		confirmation_code: 'ABC123',
		confirmed: true,
	})
})

describe('post', () => {
	it('fails to authenticate missing credentials', async () => {
		const { req, res } = createMocks<ConnectedRequest, NextApiResponse>({
			method: 'POST',
			body: {},
		})

		await handler(req, res)

		expect(res._getStatusCode()).toBe(400)
		expect(JSON.parse(res._getData())).toHaveProperty('type', 'AuthError')
	})

	it('authenticates valid credentials', async () => {
		const { req, res } = createMocks<ConnectedRequest, NextApiResponse>({
			method: 'POST',
			body: {
				email: completeAccount.emailAddress,
				password: completeAccount.password,
			},
		})

		await handler(req, res)

		expect(res._getStatusCode()).toBe(200)
		expect(JSON.parse(res._getData())).toHaveProperty('token')
		const token = JSON.parse(res._getData()).token
		expect(jwt.verify(token, process.env.TOKEN_SECRET)).toBeTruthy()
	})

	it('fails to authenticate an incorrect password', async () => {
		const { req, res } = createMocks<ConnectedRequest, NextApiResponse>({
			method: 'POST',
			body: {
				email: completeAccount.emailAddress,
				password: 'wrongPassword',
			},
		})

		await handler(req, res)

		expect(res._getStatusCode()).toBe(400)
		expect(JSON.parse(res._getData())).toHaveProperty('type', 'AuthError')
	})

	it('fails to authenticate a non-existent account', async () => {
		const { req, res } = createMocks<ConnectedRequest, NextApiResponse>({
			method: 'POST',
			body: {
				email: 'dan@apple.com',
				password: completeAccount.password,
			},
		})

		await handler(req, res)

		expect(res._getStatusCode()).toBe(400)
		expect(JSON.parse(res._getData())).toHaveProperty('type', 'AuthError')
	})
})

afterAll(async () => {
	await cleanupDatabase(connection)
})
