export interface CreateOrderRequest {
	checkout_session_id: string
	tub_id: number
	start_date: string
	end_date: string
	first_name: string
	last_name: string
	email: string
	telephone_number: string
	address_line_1: string
	address_line_2: string
	address_line_3: string
	special_requests: string
	referee: string
	postcode: string
}

export interface DeleteOrderRequest {
	id: string
}

export interface OrderResponse {}
