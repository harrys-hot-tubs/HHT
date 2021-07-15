export interface APIError {
	type:
		| 'RangeError'
		| 'FormatError'
		| 'AuthError'
		| 'ReferenceError'
		| 'Error'
		| 'StatusError'
	message: string
}
