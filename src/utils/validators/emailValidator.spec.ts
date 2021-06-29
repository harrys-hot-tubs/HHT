import validateEmail from '@utils/validators/emailValidator'

describe('email validator', () => {
	const VALID_CASES: [string, boolean][] = [
		['email@example.com', true],
		['firstname.lastname@example.com', true],
		['email@subdomain.example.com', true],
		['firstname+lastname@example.com', true],
		['email@123.123.123.123', true],
		['"email"@example.com', true],
		['1234567890@example.com', true],
		['email@example-one.com', true],
		['_______@example.com', true],
		['email@example.name', true],
		['email@example.museum', true],
		['email@example.co.jp', true],
		['firstname-lastname@example.com', true],
	]

	const INVALID_CASES: [string, boolean][] = [
		['plainaddress', false],
		['#@%^%#$@#$@#.com', false],
		['@example.com', false],
		['Joe Smith <email@example.com>', false],
		['email.example.com', false],
		['email@example@example.com', false],
		['.email@example.com', false],
		['email.@example.com', false],
		['email..email@example.com', false],
		['email@example.com (Joe Smith)', false],
		['email@example', false],
		['email@example..com', false],
		['Abc..123@example.com', false],
	]

	test.each([...VALID_CASES, ...INVALID_CASES])(
		'given the address %p, returns %p',
		(address, expectedResult) => {
			const result = validateEmail(address)
			expect(result).toEqual(expectedResult)
		}
	)
})
