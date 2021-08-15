import { APIError, ErrorType, ErrorTypes } from '@typings/api/Error'

/**
 * Error thrown when the format of an object is incorrect.
 */
export class FormatError extends APIError {
	constructor(message: string) {
		super(message, 'FormatError')
	}
}

/**
 * Error thrown when an object is outside of a particular range.
 */
export class RangeError extends APIError {
	constructor(message: string) {
		super(message, 'RangeError')
	}
}
/**
 * Error thrown when access is attempted by an unauthorised entity.
 */
export class AuthError extends APIError {
	constructor(message: string) {
		super(message, 'AuthError')
	}
}

/**
 * Error thrown when an entity is not found.
 */
export class NotFoundError extends APIError {
	constructor(message: string) {
		super(message, 'NotFoundError')
	}
}

/**
 * Error thrown when the status of an entity is incorrect.
 */
export class StatusError extends APIError {
	constructor(message: string) {
		super(message, 'StatusError')
	}
}

/**
 * Error thrown when an unexpected condition occurs.
 */
export class UnexpectedError extends APIError {
	constructor(message: string) {
		super(message, 'UnexpectedError')
	}
}

export const isAPIError = (error: Error): error is APIError => {
	return ErrorTypes.includes(error.name as ErrorType)
}
