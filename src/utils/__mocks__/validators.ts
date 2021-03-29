import { PostcodeError } from '@utils/validators'

export const mockValidator = jest.fn<
	Promise<[boolean, PostcodeError]>,
	[string]
>()

const mock = jest.mock('@utils/validators', () => {
	return {
		validatePostcode: mockValidator,
	}
})

export default mock
