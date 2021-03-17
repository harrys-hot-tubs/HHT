export interface APIError {
	type: 'RangeError' | 'FormatError' | 'Error'
	message: string
}
