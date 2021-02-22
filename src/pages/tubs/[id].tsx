import { TubDB } from '@typings/Tub'
import { connector } from '@utils/db'
import { GetServerSideProps } from 'next'

interface PageProps {
	tub: TubDB
}

const Tub = ({ tub }: PageProps) => {
	return (
		<div>
			<h1>ID: {tub.tub_id}</h1>
			<h2>Location: {tub.location_id}</h2>
			<h3>Max Capacity: {tub.max_capacity}</h3>
		</div>
	)
}

export const getServerSideProps: GetServerSideProps<PageProps> = async (
	context
) => {
	// TODO refactor connector so it can be used in getSSP
	const db = connector()()
	const tub = await db<TubDB>('tubs')
		.select()
		.first()
		.where('tub_id', '=', context.params.id)
	db.destroy()

	if (!tub)
		return {
			redirect: {
				destination: '/hire',
				permanent: false,
			},
		}

	return {
		props: {
			tub,
		},
	}
}

export default Tub
