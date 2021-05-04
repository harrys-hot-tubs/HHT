export interface FulfilmentDB {
	fulfilment_id: number
	account_id: number
	order_id: text
	created_at: string
	status: FulfilmentStatus
}

export type FulfilmentStatus = 'delivered' | 'returned' | 'undelivered'
