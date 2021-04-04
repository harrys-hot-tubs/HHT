export interface APIError {
	type: 'RangeError' | 'FormatError' | 'AuthError' | 'Error'
	message: string
}
