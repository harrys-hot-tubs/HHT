export interface APIError {
	type: 'RangeError' | 'FormatError' | 'AuthError' | 'ReferenceError' | 'Error'
	message: string
}
