export type EmailRequest = VerifyEmailRequest | ValidateConfirmationCodeRequest
export type EmailResponse =
	| VerifyEmailResponse
	| ValidateConfirmationCodeResponse

export interface VerifyEmailRequest {
	validate: false
	email: string
}

export interface ValidateConfirmationCodeRequest {
	validate: true
	email: string
	confirmationCode: string
}

export type VerifyEmailResponse = VerifyEmailSuccess | VerifyEmailFailed

export interface VerifyEmailSuccess {
	error: false
	inserted: boolean
}

export interface VerifyEmailFailed {
	error: true
	message: string
}

export type ValidateConfirmationCodeResponse =
	| {
			error: false
			valid: boolean
	  }
	| {
			error: true
			message: string
	  }
