import {
	FailedRangeResponse as FailedRangeResponseType,
	SuccessfulRangeResponse as SuccessfulRangeResponseType,
} from '@typings/api/Locations'
import { LocationResponse } from '@typings/api/Postcode'
import { AxiosResponse } from 'axios'
import { BIR } from './coordinateFixtures'

export const CHESTER = 'CH1 1ER'
export const LIVERPOOL = 'L1 1DN'
export const SHEFFIELD = 'S1 2BF'
export const BIRMINGHAM = 'B1 1HQ'
export const CENTRAL_LONDON = 'SW1V 3JD'
export const NEWCASTLE = 'NE1 1JW'
export const DURHAM = 'DH1 1BL'
export const BATH = 'BA2 7AY'
export const EDINBURGH = 'EH1 1EG'

export const SuccessfulRangeResponse: SuccessfulRangeResponseType = {
	inRange: true,
	closest: {
		location_id: 1,
		name: 'Test location',
		postcode: 'CH1',
		latitude: 0,
		longitude: 0,
		initial_price: 109,
		night_price: 20,
	},
}

export const FailedRangeResponse: FailedRangeResponseType = {
	inRange: false,
}

export const SuccessfulCoordinatesResponse: AxiosResponse<LocationResponse> = {
	status: 200,
	statusText: 'OK',
	headers: { 'Content-Type': 'application/json' },
	config: {},
	data: {
		result: { latitude: BIR.latitude, longitude: BIR.longitude },
	},
}
