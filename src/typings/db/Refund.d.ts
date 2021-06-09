import { AccountDB } from '@typings/db/Account'
import { OrderDB, PopulatedOrder } from '@typings/db/Order'

export interface RefundDB {
	order_id: OrderDB['id']
	damaged: boolean
	damage_information?: string
	account_id: AccountDB['account_id']
	settled: boolean
}

export interface PopulatedRefund extends Omit<RefundDB, 'order_id'> {
	order: PopulatedOrder
}
