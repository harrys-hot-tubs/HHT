import { OrderDB } from '@typings/api/Order'
import { BookingDB } from '@typings/Booking'
import { LocationDB } from '@typings/Location'
import { TubDB } from '@typings/Tub'
import { connector } from '@utils/db'
import knex from 'knex'

// TODO fix database connection interference
export let connection = connector()()

export const cleanupDatabase = async (db: knex) => {
	try {
		await resetTables(db)
		await resetSequences(db)
		await db.destroy()
	} catch (error) {
		console.error(error)
	}
}

export const resetTables = async (db: knex) => {
	await db<OrderDB>('orders').del()
	await db<BookingDB>('bookings').del()
	await db<TubDB>('tubs').del()
	await db<LocationDB>('locations').del()
}

export const resetSequences = async (db: knex) => {
	await db.raw('ALTER SEQUENCE bookings_booking_id_seq RESTART WITH 1')
	await db.raw('ALTER SEQUENCE locations_locationid_seq RESTART WITH 1')
	await db.raw('ALTER SEQUENCE tubs_tubid_seq RESTART WITH 1')
}
