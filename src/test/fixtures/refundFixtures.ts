import { driverAccount } from '@fixtures/accountFixtures'
import { storedOrder } from '@fixtures/orderFixtures'
import { RefundDB } from '@typings/db/Refund'

export const refunds: RefundDB[] = [
	{
		account_id: driverAccount.account_id,
		order_id: storedOrder.id,
		damaged: false,
		settled: false,
	},
]
