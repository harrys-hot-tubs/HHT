export const ErrorTypes = [
	'RangeError',
	'FormatError',
	'AuthError',
	'NotFoundError',
	'StatusError',
	'UnexpectedError',
	'InvalidRequestError',
] as const

export type ErrorType = typeof ErrorTypes[number]

export class APIError extends Error {
	constructor(message: string, public type: ErrorType) {
		super(message)
		this.name = type
	}
}

export interface APIErrorResponse {
	type: ErrorType
	message: string
}
