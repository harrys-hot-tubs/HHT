import { Knex } from 'knex'
import { NextApiRequest } from 'next'

export interface ApiRequest<T> extends Omit<NextApiRequest, 'body'> {
	body: T
}

export interface ConnectedRequest<T = any> extends ApiRequest<T> {
	db: Knex
}
