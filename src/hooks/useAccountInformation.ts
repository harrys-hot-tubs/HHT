import { FormattedAccount } from '@typings/api/Accounts'
import { TokenAccount } from '@typings/api/Auth'
import { AccountDB } from '@typings/db/Account'
import { isTokenAccount } from '@utils/validators/tokenValidator'
import axios from 'axios'
import Cookies from 'js-cookie'
import jwt from 'jsonwebtoken'
import useSWR from 'swr'

const fetcher = async (url: string): Promise<FormattedAccount> => {
	try {
		const res = await axios.get(url)
		if (res.data.error === true) throw new Error(res.data.message)

		return res.data.account
	} catch (error) {
		console.error(error.message)
		throw error
	}
}

const useAccountInformation = (): {
	account: FormattedAccount
	isLoading: boolean
	isError: any
} => {
	const id = getAccountID()
	const { data, error } = useSWR<FormattedAccount>(
		`/api/accounts/${id}`,
		fetcher
	)

	return {
		account: data,
		isLoading: !error && !data,
		isError: error,
	}
}

/**
 * Determines the account_id of the currently authenticated account if it exists.
 *
 * @returns The account_id of the currently authenticated account if one exists, NaN otherwise.
 */
const getAccountID = (): AccountDB['account_id'] => {
	try {
		const token = Cookies.get('token')
		const account = parseToken(token)
		return account.account_id
	} catch (error) {
		console.error(error.message)
		return NaN
	}
}

/**
 * Transforms a string into a tokenised account, if the string is a valid token.
 * ! Does not check the providence of the token.
 *
 * @param token The string to be turned into a tokenised account, if it is valid.
 * @returns The account represented by the token if it is valid.
 * @throws An error describing how the token is not valid.
 */
const parseToken = (token: string): TokenAccount => {
	if (!token) throw new Error('missing')

	const payload: unknown = jwt.decode(token)

	if (!isTokenAccount(payload)) throw new Error('invalid')

	return payload
}

export default useAccountInformation
