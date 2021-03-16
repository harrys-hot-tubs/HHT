import {
	FailedRangeResponse as FailedRangeResponseType,
	SuccessfulRangeResponse as SuccessfulRangeResponseType,
} from '@typings/api/Locations'
import { LocationResponse } from '@typings/api/Postcode'
import { AxiosResponse } from 'axios'
import { bir } from './coordinateFixtures'

export const chester = 'CH1 1ER'
export const liverpool = 'L1 1DN'
export const sheffield = 'S1 2BF'
export const birmingham = 'B1 1HQ'
export const centralLondon = 'SW1V 3JD'
export const newcastle = 'NE1 1JW'
export const durham = 'DH1 1BL'
export const bath = 'BA2 7AY'
export const edinburgh = 'EH1 1EG'

export const successfulRangeResponse: SuccessfulRangeResponseType = {
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

export const failedRangeResponse: FailedRangeResponseType = {
	inRange: false,
}

export const successfulCoordinatesResponse: AxiosResponse<LocationResponse> = {
	status: 200,
	statusText: 'OK',
	headers: { 'Content-Type': 'application/json' },
	config: {},
	data: {
		result: { latitude: bir.latitude, longitude: bir.longitude },
	},
}
