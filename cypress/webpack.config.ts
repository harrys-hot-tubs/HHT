import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin'
import webpack from 'webpack'

const config: webpack.Configuration = {
	mode: 'development',
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				exclude: [/node_modules/],
				use: [
					{
						loader: 'babel-loader',
						options: {
							presets: ['@babel/preset-react', 'next/babel'],
							plugins: ['@babel/plugin-proposal-class-properties'],
						},
					},
				],
			},
		],
	},
	resolve: {
		plugins: [new TsconfigPathsPlugin({})],
	},
}

export default config
