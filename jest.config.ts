export default {
	clearMocks: false,
	resetMocks: false,
	coverageDirectory: 'coverage',
	coverageProvider: 'v8',
	globalSetup: '<rootDir>/src/test/setup/index.ts',
	globals: {
		'ts-jest': {
			tsConfig: 'tsconfig.jest.json',
		},
	},
	preset: 'ts-jest',
	projects: [
		{
			setupFilesAfterEnv: ['@testing-library/jest-dom/extend-expect'],
			setupFiles: ['jest-localstorage-mock'],
			displayName: 'frontend',
			testEnvironment: 'jsdom',
			testMatch: ['<rootDir>/**/*.spec.tsx', '<rootDir>/**/use*.spec.ts'],
			transform: {
				'^.+\\.(js|ts)$': 'ts-jest',
				'^.+\\.(jsx|tsx)$': 'babel-jest',
				'^.+\\.svg$': 'jest-svg-transformer',
			},
			moduleNameMapper: {
				'@components/(.*)$': '<rootDir>/src/components/$1',
				'@pages/(.*)$': '<rootDir>/src/pages/$1',
				'@hooks/(.*)$': '<rootDir>/src/hooks/$1',
				'@typings/(.*)$': '<rootDir>/src/typings/$1',
				'@utils/(.*)$': '<rootDir>/src/utils/$1',
				'@test/(.*)$': '<rootDir>/src/test/$1',
				'@fixtures/(.*)$': '<rootDir>/src/test/fixtures/$1',
				'@helpers/(.*)$': '<rootDir>/src/test/helpers/$1',
			},
		},
		{
			displayName: 'backend',
			testEnvironment: 'node',
			testPathIgnorePatterns: [
				'^.+\\.(tsx)?$',
				'<rootDir>/cypress/',
				'<rootDir>/src/hooks/use\\w*.spec.ts',
			],
			moduleNameMapper: {
				'@components/(.*)$': '<rootDir>/src/components/$1',
				'@pages/(.*)$': '<rootDir>/src/pages/$1',
				'@hooks/(.*)$': '<rootDir>/src/hooks/$1',
				'@typings/(.*)$': '<rootDir>/src/typings/$1',
				'@utils/(.*)$': '<rootDir>/src/utils/$1',
				'@test/(.*)$': '<rootDir>/src/test/$1',
				'@fixtures/(.*)$': '<rootDir>/src/test/fixtures/$1',
			},
		},
	],
	roots: ['<rootDir>/src'],
	testEnvironment: 'node',
}