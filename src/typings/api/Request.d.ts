import { Knex } from 'knex'
import { NextApiRequest } from 'next'

export interface ConnectedRequest extends NextApiRequest {
	db: Knex
}
