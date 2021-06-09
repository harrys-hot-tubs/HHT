import { AccountDB } from '@typings/db/Account'
import { OrderDB } from '@typings/db/Order'

export interface FulfilmentDB {
	fulfilment_id: number
	account_id: AccountDB['account_id']
	order_id: OrderDB['id']
	created_at: string
	status: FulfilmentStatus
}

export type FulfilmentStatus = 'delivered' | 'returned' | 'undelivered'
