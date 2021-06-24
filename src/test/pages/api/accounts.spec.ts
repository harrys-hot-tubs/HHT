import {
	completeAccount,
	driverAccount,
	managerAccount,
	missingPassword,
	missingRoles,
} from '@fixtures/accountFixtures'
import { inDateAccountToken } from '@fixtures/authFixtures'
import { locations } from '@fixtures/locationFixtures'
import { storedStaff } from '@fixtures/staffFixtures'
import { cleanupDatabase, connection } from '@helpers/DBHelper'
import handler, { prepareAccount } from '@pages/api/accounts'
import { ConnectedRequest } from '@typings/api/Request'
import { AccountDB } from '@typings/db/Account'
import { LocationDB } from '@typings/db/Location'
import { StaffDB } from '@typings/db/Staff'
import { NextApiResponse } from 'next'
import { createMocks } from 'node-mocks-http'

describe('post', () => {
	afterEach(async () => {
		await connection<AccountDB>('accounts').del()
	})

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
		await connection<AccountDB>('accounts').insert({
			confirmation_code: missingRoles.confirmationCode,
			email_address: missingRoles.emailAddress,
			confirmed: false,
		})
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
		await connection<AccountDB>('accounts').insert({
			email_address: completeAccount.emailAddress,
			confirmation_code: completeAccount.confirmationCode,
			confirmed: false,
		})
		const { req, res } = createMocks<ConnectedRequest, NextApiResponse>({
			method: 'POST',
			body: completeAccount,
		})

		await handler(req, res)

		expect(res._getStatusCode()).toBe(200)
		expect(JSON.parse(res._getData())).toMatchObject({
			email_address: completeAccount.emailAddress,
			first_name: completeAccount.firstName,
			last_name: completeAccount.lastName,
			telephone_number: completeAccount.telephoneNumber,
			account_roles: `{customer}`,
		})
	})

	it('does not add an account to an already confirmed email address', async () => {
		const preparedAccount = await prepareAccount(completeAccount)
		await connection<AccountDB>('accounts').insert({
			...preparedAccount,
			account_roles: ['driver'],
			confirmation_code: 'ABC123',
			confirmed: true,
		})

		const { req, res } = createMocks<ConnectedRequest, NextApiResponse>({
			method: 'POST',
			body: completeAccount,
		})

		await handler(req, res)

		expect(res._getStatusCode()).toBe(400)
		expect(JSON.parse(res._getData())).toHaveProperty('type', 'Error')
	})
})

describe('get', () => {
	const altDriver: AccountDB = {
		...driverAccount,
		account_id: 3,
		email_address: 'dan@gmail.com',
	}

	beforeAll(async () => {
		await connection<AccountDB>('accounts').insert([
			driverAccount,
			managerAccount,
			altDriver,
		])
		await connection<LocationDB>('locations').insert(locations)
		await connection<StaffDB>('staff').insert(storedStaff)
	})

	it('returns an error for an unauthorized account', async () => {
		const { req, res } = createMocks<ConnectedRequest, NextApiResponse>({
			method: 'GET',
			cookies: {
				token: inDateAccountToken(managerAccount),
			},
		})

		await handler(req, res)

		expect(res._getStatusCode()).toBe(401)
		expect(res._getData()).toEqual('Not authorised.')
	})

	it('returns an error for drivers without a staff entry', async () => {
		const { req, res } = createMocks<ConnectedRequest, NextApiResponse>({
			method: 'GET',
			cookies: {
				token: inDateAccountToken(altDriver),
			},
		})

		await handler(req, res)

		expect(res._getStatusCode()).toBe(500)
		expect(res._getData()).toEqual(
			`Missing staff entry for account ${altDriver.account_id}`
		)
	})

	it('responds with a location for a driver with a staff entry', async () => {
		const { req, res } = createMocks<ConnectedRequest, NextApiResponse>({
			method: 'GET',
			cookies: {
				token: inDateAccountToken(driverAccount),
			},
		})

		await handler(req, res)

		expect(res._getStatusCode()).toBe(200)
		expect(JSON.parse(res._getData())).toHaveProperty('name', locations[0].name)
		expect(JSON.parse(res._getData())).toHaveProperty(
			'location_id',
			locations[0].location_id
		)
	})
})

afterAll(async () => {
	await cleanupDatabase(connection)
})
