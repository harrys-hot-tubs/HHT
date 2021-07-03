import { ConnectedRequest } from '@typings/api'
import {
	CreateAccountRequest,
	CreateAccountResponse,
} from '@typings/api/Accounts'
import { AccountDB } from '@typings/db/Account'
import { LocationDB } from '@typings/db/Location'
import db from '@utils/db'
import { getToken, isAuthorised } from '@utils/SSAuth'
import bcrypt from 'bcryptjs'
import { NextApiResponse } from 'next'

export const SALT_ROUNDS = 10

async function handler(req: ConnectedRequest, res: NextApiResponse) {
	switch (req.method) {
		case 'POST':
			return post(req, res)
		case 'GET':
			return get(req, res)
		default:
			res.setHeader('Allow', ['POST', 'GET'])
			res.status(405).end('Method not allowed.')
	}
}

const post = async (
	req: ConnectedRequest<CreateAccountRequest>,
	res: NextApiResponse<CreateAccountResponse>
) => {
	const { db, body } = req

	try {
		const isValidRequest =
			(
				await db<AccountDB>('accounts')
					.select('account_id')
					.where('email_address', '=', body.emailAddress)
					.andWhere('confirmation_code', '=', body.confirmationCode)
					.andWhere('confirmed', '=', false)
			).length === 1

		if (!isValidRequest)
			throw new Error(
				`Email address ${body.emailAddress} could not be validated.`
			)

		const preparedAccount = await prepareAccount(body)
		const { confirmation_code, password_hash, ...storedAccount } = (
			await db<AccountDB>('accounts')
				.update(preparedAccount, '*')
				.where('email_address', '=', body.emailAddress)
				.andWhere('confirmation_code', '=', body.confirmationCode)
				.andWhere('confirmed', '=', false)
		)[0]

		return res.status(200).json(storedAccount)
	} catch (error) {
		console.error(error.message)
		return res
			.status(400)
			.json({ type: 'Error', message: 'Failed to create account.' })
	}
}

/**
 * Transforms the constituent parts of an account into the final form to be stored in the database.
 *
 * @param account The components of an account to be created.
 * @returns An account object to be stored in the database.
 */
export const prepareAccount = async (
	account: CreateAccountRequest
): Promise<
	Pick<
		AccountDB,
		| 'email_address'
		| 'password_hash'
		| 'first_name'
		| 'last_name'
		| 'telephone_number'
		| 'confirmed'
	>
> => {
	const hashedPassword = await hashPassword(account.password)
	const preparedAccount: Pick<
		AccountDB,
		| 'email_address'
		| 'password_hash'
		| 'first_name'
		| 'last_name'
		| 'telephone_number'
		| 'confirmed'
	> = {
		email_address: account.emailAddress,
		password_hash: hashedPassword,
		first_name: account.firstName,
		last_name: account.lastName,
		telephone_number: account.telephoneNumber,
		confirmed: true,
	}
	return preparedAccount
}

/**
 * Hashes a password to be stored in the database.
 *
 * @param password The password to be hashed.
 * @returns A promise that resolves to the hashed representation of the password.
 */
export const hashPassword = async (password: string) => {
	return bcrypt.hash(password, SALT_ROUNDS)
}

const get = async (req: ConnectedRequest, res: NextApiResponse) => {
	try {
		const token = getToken(req)
		const status = await isAuthorised(token, ['driver'])
		if (status.authorised) {
			const { db } = req
			const location = await db<LocationDB>('locations')
				.select('locations.name', 'locations.location_id')
				.join('staff', 'staff.location_id', 'locations.location_id')
				.where('staff.account_id', '=', status.payload.account_id)
				.first()

			if (location === undefined)
				return res
					.status(500)
					.send(`Missing staff entry for account ${status.payload.account_id}`)

			return res.status(200).json(location)
		} else {
			return res.status(401).send('Not authorised.')
		}
	} catch (error) {
		console.error(error.message)
		return res.status(500).send('A problem occurred.')
	}
}

export default db()(handler)
