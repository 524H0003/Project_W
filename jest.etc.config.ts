import type { Config } from 'jest';

const config: Config = {
	testEnvironment: 'node',
	detectOpenHandles: true,
	moduleDirectories: ['node_modules', 'src'],
	transform: { '^.+.tsx?$': ['ts-jest', {}] },
	testMatch: [
		'**/?(*.)+(spec).ts',
		'!**/?(*.)+(controller.spec).ts',
		'!**/?(*.)+(resolver.spec).ts',
		'!**/?(*.)+(service.spec).ts',
	],
	reporters: [
		'default',
		['github-actions', { silent: false }],
		['jest-junit', { outputDirectory: 'reports', outputName: 'etc.xml' }],
	],
	collectCoverage: true,
	coverageReporters: [['text', { file: 'etc.txt' }]],
	collectCoverageFrom: [
		'src/**/*.ts',
		'!src/*.ts',
		'!src/build/*',
		'!src/app/utils/*',
		'!src/app/admin/*',
		'!src/app/graphql/*',
		'!src/app/interceptor/*',
		'!src/app/typeorm/*',
		'!**/*.controller.ts',
		'!**/*.resolver.ts',
		'!**/*.service.ts',
		'!**/*.dto.ts',
		'!**/*.model.ts',
		'!**/*.entity.ts',
		'!**/*.module.ts',
		'!**/*.spec.ts',
		'!**/*.spec.utils.ts',
		'!**/*.graphql.ts',
	],
};

export default config;
