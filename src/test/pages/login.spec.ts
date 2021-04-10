import { storedAccount } from '@fixtures/accountsFixtures'
import { inDateAccountToken } from '@fixtures/authFixtures'
import { cleanupDatabase, connection } from '@helpers/DBHelper'
import { getServerSideProps } from '@pages/login'
import { AccountDB } from '@typings/db/Account'
import { SSRRequest } from '@utils/SSAuth'
import { GetServerSidePropsContext } from 'next'
import { ParsedUrlQuery } from 'querystring'

type ExpectedContent = GetServerSidePropsContext<ParsedUrlQuery>
interface IncompleteContext
	extends Omit<Partial<GetServerSidePropsContext<ParsedUrlQuery>>, 'req'> {
	req: Pick<SSRRequest, 'cookies'>
}

beforeAll(async () => {
	await connection<AccountDB>('accounts').insert([storedAccount])
})

it('redirects to the profile page if a JWT is provided', async () => {
	const incompleteContext: IncompleteContext = {
		req: { cookies: { token: inDateAccountToken } },
	}

	const response = await getServerSideProps(
		incompleteContext as ExpectedContent
	)
	expect(response).toHaveProperty('redirect')
})

afterAll(async () => {
	await cleanupDatabase(connection)
})
