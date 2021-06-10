import { driverAccount } from '@fixtures/accountFixtures'
import { storedOrder } from '@fixtures/orderFixtures'
import { FulfilmentDB } from '@typings/db/Fulfilment'

export const fulfilments: FulfilmentDB[] = [
	{
		account_id: driverAccount.account_id,
		fulfilment_id: 0,
		order_id: storedOrder.id,
		status: 'undelivered',
		created_at: '2021-05-02T19:44:45.000Z',
	},
	{
		account_id: driverAccount.account_id,
		fulfilment_id: 1,
		order_id: storedOrder.id,
		status: 'delivered',
		created_at: '2021-05-08T19:44:45.000Z',
	},
]
