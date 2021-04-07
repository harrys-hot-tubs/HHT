import { inDateAccountToken } from '@fixtures/authFixtures'
import { getServerSideProps } from '@pages/login'
import { SSRRequest } from '@utils/SSAuth'
import { GetServerSidePropsContext } from 'next'
import { ParsedUrlQuery } from 'querystring'

type ExpectedContent = GetServerSidePropsContext<ParsedUrlQuery>
interface IncompleteContext
	extends Omit<Partial<GetServerSidePropsContext<ParsedUrlQuery>>, 'req'> {
	req: Pick<SSRRequest, 'cookies'>
}

it('redirects to the profile page if a JWT is provided', async () => {
	const incompleteContext: IncompleteContext = {
		req: { cookies: { token: inDateAccountToken } },
	}

	const response = await getServerSideProps(
		incompleteContext as ExpectedContent
	)
	expect(response).toHaveProperty('redirect')
})
