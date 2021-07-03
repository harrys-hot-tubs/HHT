/**
 * Uses a regular expression to try and determine if a string is an email address.
 *
 * @param email The possible email address to be validated.
 * @returns True if the provided email appears to be valid, false otherwise.
 */
const validateEmail = (email: string): boolean => {
	/** Taken from https://stackoverflow.com/a/46181/13679467 */
	const exp =
		/^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i
	return exp.test(email)
}

export default validateEmail
