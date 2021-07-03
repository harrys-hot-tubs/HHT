import {
	generateConfirmationCode,
	sendConfirmationEmail,
} from '@pages/api/email/index'
import { ConnectedRequest } from '@typings/api'
import {
	EmailRequest,
	ValidateConfirmationCodeRequest,
	ValidateConfirmationCodeResponse,
	VerifyEmailRequest,
	VerifyEmailResponse,
} from '@typings/api/Email'
import { AccountDB } from '@typings/db/Account'
import db from '@utils/db'
import { getToken, isAuthorised } from '@utils/SSAuth'
import validateEmail from '@utils/validators/emailValidator'
import { Knex } from 'knex'
import { NextApiResponse } from 'next'

async function handler(req: ConnectedRequest, res: NextApiResponse) {
	switch (req.method) {
		case 'POST':
			return post(req, res)
		default:
			res.setHeader('Allow', ['POST'])
			res.status(405).end('Method not allowed.')
	}
}

const post = async (
	req: ConnectedRequest<EmailRequest>,
	res: NextApiResponse
) => {
	const {
		db,
		query: { id },
		body,
	} = req
	const token = getToken(req)
	const status = await isAuthorised(token, ['*'])
	if (!status.authorised || status.payload.account_id !== Number(id))
		return res.status(401).json({
			error: true,
			message: 'Not authorised.',
		})

	if (body.validate === false) {
		return verifyEmail(db, body, Number(id), res)
	} else {
		return confirmCode(db, body, Number(id), res)
	}
}

/**
 * Verifies that an email address is valid by sending a confirmation email to it.
 *
 * @param db Database connection.
 * @param body The body of the request containing the email address.
 * @param account_id The id of the account to have its email verified.
 * @param res The response object to be sent to the client.
 * @returns The response object.
 */
const verifyEmail = async (
	db: Knex,
	{ email }: VerifyEmailRequest,
	account_id: AccountDB['account_id'],
	res: NextApiResponse<VerifyEmailResponse>
) => {
	try {
		if (!validateEmail(email))
			return res.status(400).json({
				error: true,
				message: `${email} is not an email address.`,
			})

		const alreadyExists =
			(
				await db<AccountDB>('accounts')
					.select('account_id')
					.where('email_address', '=', email)
					.andWhere('confirmed', '=', true)
			).length > 0
		if (alreadyExists)
			return res.status(400).json({
				error: true,
				message: `Account with email address ${email} already exists.`,
			})

		const code = generateConfirmationCode(6)

		await db<AccountDB>('accounts')
			.where('account_id', '=', account_id)
			.update({
				confirmation_code: code,
			})

		await sendConfirmationEmail(email, code)

		return res.status(200).json({
			error: false,
			inserted: true,
		})
	} catch (error) {
		console.error(error.message)
		return res.status(500).json({ error: true, message: error.message })
	}
}

/**
 * Confirms that the confirmation code is the one send to the user previously.
 *
 * @param db Database connection.
 * @param body The body of the request containing the confirmation code and the email address it should have been sent to.
 * @param account_id The id of the account to have its email verified.
 * @param res The response object to be sent to the client.
 * @returns The response object.
 */
const confirmCode = async (
	db: Knex,
	{ confirmationCode }: Omit<ValidateConfirmationCodeRequest, 'email_address'>,
	account_id: AccountDB['account_id'],
	res: NextApiResponse<ValidateConfirmationCodeResponse>
) => {
	try {
		const isValid =
			(
				await db<AccountDB>('accounts')
					.select('*')
					.where('account_id', '=', account_id)
					.andWhere('confirmation_code', '=', confirmationCode)
			).length === 1

		return res.status(200).json({ error: false, valid: isValid })
	} catch (error) {
		console.error(error.message)
		return res.status(500).json({ error: true, message: error.message })
	}
}

export default db()(handler)
