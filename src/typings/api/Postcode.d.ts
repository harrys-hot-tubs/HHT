export interface ValidationResponse {
	status: number
	result: boolean
}

export interface LocationResponse {
	result: {
		latitude: number
		longitude: number
	}
}
