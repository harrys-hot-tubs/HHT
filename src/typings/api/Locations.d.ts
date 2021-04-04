import { LocationDB } from '@typings/db/Location'

export type SuccessfulRangeResponse = {
	inRange: true
	closest: LocationDB
}

export type FailedRangeResponse = {
	inRange: false
}

export type RangeResponse = SuccessfulRangeResponse | FailedRangeResponse

export interface RangeRequest {
	latitude: number
	longitude: number
}
