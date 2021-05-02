export interface RefundDB {
	order_id: string
	damaged: boolean
	damage_information?: string
	account_id: number
}
