import { hashPassword } from '@pages/api/accounts'
import {
	generateConfirmationCode,
	sendConfirmationCodeEmail,
} from '@pages/api/email/index'
import { ConnectedRequest } from '@typings/api'
import {
	ResetPasswordRequest,
	ResetPasswordResponse,
} from '@typings/api/Accounts'
import {
	EmailRequest,
	ValidateConfirmationCodeRequest,
	ValidateConfirmationCodeResponse,
	VerifyEmailRequest,
	VerifyEmailResponse,
} from '@typings/api/Email'
import { AccountDB } from '@typings/db/Account'
import db from '@utils/db'
import validateEmail from '@utils/validators/emailValidator'
import { Knex } from 'knex'
import { NextApiResponse } from 'next'

async function handler(req: ConnectedRequest, res: NextApiResponse) {
	switch (req.method) {
		case 'POST':
			return post(req, res)
		case 'PATCH':
			return patch(req, res)
		default:
			res.setHeader('Allow', ['POST'])
			res.status(405).end('Method not allowed.')
	}
}

const post = async (
	req: ConnectedRequest<EmailRequest>,
	res: NextApiResponse
) => {
	const { db, body } = req

	if (body.validate === false) {
		return verifyEmail(db, body, res)
	} else {
		return confirmCode(db, body, res)
	}
}

/**
 * Verifies that an email address is valid by sending a confirmation email to it.
 *
 * @param db Database connection.
 * @param body The body of the request containing the email address.
 * @param res The response object to be sent to the client.
 * @returns The response object.
 */
const verifyEmail = async (
	db: Knex,
	{ email }: VerifyEmailRequest,
	res: NextApiResponse<VerifyEmailResponse>
) => {
	try {
		if (!validateEmail(email))
			return res.status(400).json({
				error: true,
				message: `${email} is not an email address.`,
			})

		const account = await db<AccountDB>('accounts')
			.select('account_id')
			.where('email_address', '=', email)
			.andWhere('confirmed', '=', true)
			.first()

		if (account === undefined)
			return res.status(400).json({
				error: true,
				message: `An account with email address ${email} does not exist.`,
			})

		const code = generateConfirmationCode(8)

		await db<AccountDB>('accounts')
			.where('account_id', '=', account.account_id)
			.update({
				confirmation_code: code,
			})

		await sendConfirmationCodeEmail(email, code)

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
 * @param res The response object to be sent to the client.
 * @returns The response object.
 */
const confirmCode = async (
	db: Knex,
	{ confirmationCode, email }: ValidateConfirmationCodeRequest,
	res: NextApiResponse<ValidateConfirmationCodeResponse>
) => {
	try {
		const isValid =
			(
				await db<AccountDB>('accounts')
					.select('*')
					.where('email_address', '=', email)
					.andWhere('confirmation_code', '=', confirmationCode)
			).length === 1

		return res.status(200).json({ error: false, valid: isValid })
	} catch (error) {
		console.error(error.message)
		return res.status(500).json({ error: true, message: error.message })
	}
}

const patch = async (
	req: ConnectedRequest<ResetPasswordRequest>,
	res: NextApiResponse<ResetPasswordResponse>
) => {
	try {
		// TODO sent notification to the user when this happens.
		const { db, body } = req

		const passwordHash = await hashPassword(body.password)

		const updated = await db<AccountDB>('accounts')
			.update({
				password_hash: passwordHash,
			})
			.where('email_address', '=', body.email)
			.andWhere('confirmation_code', '=', body.confirmationCode)
			.returning('*')

		return res.status(200).json({ error: false, reset: updated.length === 1 })
	} catch (error) {
		console.error(error.message)
		return res.status(500).json({
			error: true,
			message: error.message,
		})
	}
}

export default db()(handler)
