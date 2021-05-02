import { PopulatedOrder } from '@typings/db/Order'

export interface RefundDB {
	order_id: string
	damaged: boolean
	damage_information?: string
	account_id: number
	settled: boolean
}

export interface PopulatedRefund extends Omit<RefundDB, 'order_id'> {
	order: PopulatedOrder
}
