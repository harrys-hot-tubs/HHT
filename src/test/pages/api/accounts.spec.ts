import {
	completeAccount,
	missingPassword,
	missingRoles,
} from '@fixtures/accountsFixtures'
import { cleanupDatabase, connection } from '@helpers/DBHelper'
import handler from '@pages/api/accounts'
import { ConnectedRequest } from '@typings/api/Request'
import { NextApiResponse } from 'next'
import { createMocks } from 'node-mocks-http'

describe('post', () => {
	it('fails to add an empty account', async () => {
		const { req, res } = createMocks<ConnectedRequest, NextApiResponse>({
			method: 'POST',
			body: {},
		})

		await handler(req, res)

		expect(res._getStatusCode()).toBe(400)
		expect(JSON.parse(res._getData())).toHaveProperty('type', 'Error')
	})

	it('detects an account without a password', async () => {
		const { req, res } = createMocks<ConnectedRequest, NextApiResponse>({
			method: 'POST',
			body: missingPassword,
		})

		await handler(req, res)

		expect(res._getStatusCode()).toBe(400)
		expect(JSON.parse(res._getData())).toHaveProperty('type', 'Error')
	})

	it('add an account with unspecified roles as a customer', async () => {
		const { req, res } = createMocks<ConnectedRequest, NextApiResponse>({
			method: 'POST',
			body: missingRoles,
		})

		await handler(req, res)

		expect(res._getStatusCode()).toBe(200)
		expect(JSON.parse(res._getData())).toHaveProperty(
			'account_roles',
			'{customer}'
		)
	})

	it('correctly adds a valid account', async () => {
		const { req, res } = createMocks<ConnectedRequest, NextApiResponse>({
			method: 'POST',
			body: completeAccount,
		})

		await handler(req, res)

		expect(res._getStatusCode()).toBe(200)
		expect(JSON.parse(res._getData())).toMatchObject({
			account_id: 2,
			email_address: completeAccount.emailAddress,
			first_name: completeAccount.firstName,
			last_name: completeAccount.lastName,
			telephone_number: completeAccount.telephoneNumber,
			account_roles: `{${completeAccount.accountRoles[0]}}`,
		})
	})
})

afterAll(async () => {
	await cleanupDatabase(connection)
})
