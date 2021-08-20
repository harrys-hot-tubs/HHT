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
import validateEmail from '@utils/validators/emailValidator'
import { Knex } from 'knex'
import { NextApiResponse } from 'next'
import mj, { Email } from 'node-mailjet'

const mailjet = mj.connect(process.env.MJ_PUBLIC, process.env.MJ_SECRET)

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

		const awaitingConfirmation =
			(
				await db<AccountDB>('accounts')
					.select('account_id')
					.where('email_address', '=', email)
					.andWhere('confirmed', '=', false)
			).length > 0

		const code = generateConfirmationCode(6)

		if (awaitingConfirmation) {
			await db<AccountDB>('accounts')
				.where('email_address', '=', email)
				.update('confirmation_code', '=', code)
		} else {
			await db<AccountDB>('accounts').insert({
				email_address: email,
				confirmed: false,
				confirmation_code: code,
			})
		}

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
	{ email, confirmationCode }: ValidateConfirmationCodeRequest,
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

/**
 * Generates a random string of characters to verify the emails provided.
 *
 * @param length The length of the confirmation code to be generated.
 * @returns A random string of length characters.
 */
export const generateConfirmationCode = (length: number): string => {
	let result = ''
	const characters = 'QWERTYUIOPASDFGHJKLZXCVBNM1234567890'
	const fieldSize = characters.length
	for (let i = 0; i < length; i++) {
		result += characters.charAt(Math.random() * fieldSize)
	}
	return result
}

/**
 * Sends a confirmation code to the specified email address.
 *
 * @param email The email address the confirmation is to be sent to.
 * @param code The confirmation code to be sent.
 */
export const sendConfirmationCodeEmail = async (email: string, code: string) =>
	mailjet.post('send', { version: 'v3.1' }).request({
		Messages: [
			{
				From: {
					Email: 'no-reply@harryshottubs.com',
					Name: "Harry's Hot Tubs",
				},
				To: [
					{
						Email: email,
					},
				],
				Subject: 'Your Confirmation Code',
				HTMLPart: `<h1>Your Code</h1><section>${code}</section>`,
			},
		],
	} as Email.SendParams)

export default db()(handler)
