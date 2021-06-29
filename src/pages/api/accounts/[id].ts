import {
	AccountRequestType,
	DeleteAccountResponse,
	FormattedAccount,
	GetAccountResponse,
	PostAccountResponse,
} from '@typings/api/Accounts'
import { ConnectedRequest } from '@typings/api/Request'
import { AccountDB } from '@typings/db/Account'
import db from '@utils/db'
import { AuthResponse, getToken, isAuthorised } from '@utils/SSAuth'
import { addDays } from 'date-fns'
import { NextApiResponse } from 'next'
import mj, { Email } from 'node-mailjet'

export const DPO_EMAIL = 'bridges.wood@gmail.com'
const mailjet = mj.connect(process.env.MJ_PUBLIC, process.env.MJ_SECRET)

async function handler(req: ConnectedRequest, res: NextApiResponse) {
	switch (req.method) {
		case 'GET':
			return await get(req, res)
		case 'POST':
			return await post(req, res)
		case 'DELETE':
			return await remove(req, res)
		default:
			res.setHeader('Allow', ['GET', 'POST', 'DELETE'])
			res.status(405).end('Method not allowed.')
	}
}

const get = async (
	req: ConnectedRequest,
	res: NextApiResponse<GetAccountResponse>
) => {
	try {
		const {
			query: { id },
		} = req
		const token = getToken(req)
		const status = await isAuthorised(token, ['*'])
		if (canAccessAccount(status, Number(id))) {
			const { db } = req
			const account = await db<AccountDB>('accounts')
				.select('*')
				.where('account_id', '=', id)
				.first()

			if (account === undefined)
				return res
					.status(500)
					.json({ error: true, message: `Account has been deleted.` })

			const formatted = formatAccount(account)
			return res.status(200).json({ error: false, account: formatted })
		} else {
			return res.status(401).json({ error: true, message: 'Not authorised.' })
		}
	} catch (error) {
		console.error(error.message)
		return res.status(500).json({ error: true, message: 'A problem occurred.' })
	}
}

const canAccessAccount = (status: AuthResponse, id: number) => {
	if (!status.authorised) return false

	const {
		payload: { account_id, account_roles },
	} = status
	return (
		status.authorised && (account_id === id || account_roles.includes('admin'))
	)
}

/**
 * Removes sensitive account information from an account before it is transmitted.
 *
 * @param account The account to be transformed.
 * @returns The account with any sensitive information removed.
 */
export const formatAccount = (account: AccountDB): FormattedAccount => {
	delete account.confirmation_code
	delete account.password_hash
	return account
}

const post = async (
	req: ConnectedRequest,
	res: NextApiResponse<PostAccountResponse>
) => {
	try {
		const {
			db,
			query: { id },
			body: { type },
		} = req
		const token = getToken(req)
		const status = await isAuthorised(token, ['*'])
		if (!status.authorised || status.payload.account_id !== Number(id))
			return res.status(401).json({
				error: true,
				message: 'Not authorised.',
			})

		const account = await db<AccountDB>('accounts')
			.select('*')
			.where('account_id', '=', status.payload.account_id)
			.first()

		if (account === undefined)
			return res.status(500).json({
				error: true,
				message: 'Account has been deleted.',
			})

		switch (type as AccountRequestType) {
			case 'GDPR':
				await sendGDPRNotificationEmails(account)
				await db<AccountDB>('accounts')
					.update({ active_information_request: true })
					.where('account_id', '=', account.account_id)

				return res.status(200).json({
					error: false,
					sent: true,
				})
			default:
				return res.status(400).json({
					error: true,
					message: `Request type ${type} is not valid.`,
				})
		}
	} catch (error) {
		return res.status(500).json({
			error: true,
			message: error.message,
		})
	}
}

/**
 * Sends GDPR request notification emails to both the subject and the data
 * protection officer at Harry's Hot Tubs.
 *
 * @param account The account that is making the GDPR request.
 * @returns A promise representing the email API request.
 */
const sendGDPRNotificationEmails = async (account: AccountDB) => {
	const deadline = addDays(new Date(), 30)

	return mailjet.post('send', { version: 'v3.1' }).request({
		Messages: [
			{
				From: {
					Email: 'no-reply@harryshottubs.com',
					Name: "Harry's Hot Tubs",
				},
				To: [
					{
						Email: DPO_EMAIL,
					},
				],
				Subject: `GDPR Request - ${account.first_name} ${account.last_name}`,
				HTMLPart: `
				<style>
				p {
					color: #000;
				}
				</style>
				<p>${account.first_name} ${account.last_name} has made an information
				request under Article 15 of the GDPR. By law, a response to their
				request is required to be submitted within 30 days (before 
				${deadline.toLocaleDateString()}) containing all of the information	that
				Harry's Hot Tubs has related to them. Please send the response to
				${account.email_address}, they have been notified as well.</p>`,
			},
			{
				From: {
					Email: 'no-reply@harryshottubs.com',
					Name: "Harry's Hot Tubs",
				},
				To: [
					{
						Email: account.email_address,
					},
				],
				Subject: `GDPR Request - Confirmation`,
				HTMLPart: `
				<style>
				p {
					color: #000;
				}
				</style>
				<p>Thank you for your information request. As required under
				Article 15 of the GDPR, you will receive all information that Harry's
				Hot Tubs has about you before ${deadline.toLocaleDateString()}.</p>`,
			},
		],
	} as Email.SendParams)
}

const remove = async (
	req: ConnectedRequest,
	res: NextApiResponse<DeleteAccountResponse>
) => {
	try {
		const {
			db,
			query: { id },
		} = req
		const token = getToken(req)
		const status = await isAuthorised(token, ['*'])
		if (!status.authorised || status.payload.account_id !== Number(id))
			return res.status(401).json({
				error: true,
				message: 'Not authorised.',
			})

		await db<AccountDB>('accounts')
			.del()
			.where('account_id', '=', status.payload.account_id)

		return res.status(200).json({
			error: false,
			deleted: true,
		})
	} catch (error) {
		return res.status(500).json({
			error: true,
			message: error.message,
		})
	}
}

export default db()(handler)
