export class FormatError extends Error {
	constructor(message: string) {
		super(message)
		this.name = 'FormatError'
	}
}

export class RangeError extends Error {
	constructor(message: string) {
		super(message)
		this.name = 'RangeError'
	}
}
