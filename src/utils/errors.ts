/**
 * Error thrown when the format of an object is incorrect.
 */
export class FormatError extends Error {
	constructor(message: string) {
		super(message)
		this.name = 'FormatError'
	}
}

/**
 * Error thrown when an object is outside of a particular range.
 */
export class RangeError extends Error {
	constructor(message: string) {
		super(message)
		this.name = 'RangeError'
	}
}
