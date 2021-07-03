import { bir } from '@fixtures/coordinateFixtures'
import {
	FailedRangeResponse as FailedRangeResponseType,
	SuccessfulRangeResponse as SuccessfulRangeResponseType,
} from '@typings/api/Locations'
import { LocationResponse } from '@typings/api/Postcode'
import { AxiosResponse } from 'axios'

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
