import { OrderDB } from '@typings/api/Order'
import { BookingDB } from '@typings/Booking'
import { LocationDB } from '@typings/Location'
import { TubDB } from '@typings/Tub'
import knex from 'knex'

let connection: knex

export const db = !connection
	? knex({
			client: 'pg',
			connection: {
				host: process.env.AWS_DB_ENDPOINT,
				user: process.env.AWS_DB_USER,
				password: process.env.AWS_DB_PASSWORD,
				database: 'test',
			},
	  })
	: connection

export const onStartup = async () => {
	try {
		await resetTables()
		await resetSequences()
	} catch (error) {
		console.log(`error`, error)
	}
}

export const resetTables = async () => {
	await db<OrderDB>('orders').del()
	await db<BookingDB>('bookings').del()
	await db<TubDB>('tubs').del()
	await db<LocationDB>('locations').del()
}

export const resetSequences = async () => {
	await db.raw('ALTER SEQUENCE bookings_booking_id_seq RESTART WITH 1')
	await db.raw('ALTER SEQUENCE locations_locationid_seq RESTART WITH 1')
	await db.raw('ALTER SEQUENCE tubs_tubid_seq RESTART WITH 1')
}
