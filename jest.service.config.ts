import type { Config } from 'jest';

const config: Config = {
	testEnvironment: 'node',
	detectOpenHandles: true,
	moduleDirectories: ['node_modules', 'src'],
	transform: { '^.+.tsx?$': ['ts-jest', {}] },
	testMatch: ['**/?(*.)+(service.spec).ts'],
	reporters: [
		'default',
		['github-actions', { silent: false }],
		[
			'jest-junit',
			{ outputDirectory: 'reports', outputName: 'service.xml' },
		],
	],
	collectCoverage: true,
	coverageReporters: [['text', { file: 'service.txt' }]],
	collectCoverageFrom: [
		'src/**/*.ts',
		'!src/**/*.controller.ts',
		'!src/**/*.resolver.ts',
		'!src/**/*.strategy.ts',
		// Compulsory
		'!src/**/*.module.ts',
		'!src/**/*.spec.ts',
		'!src/models.ts',
		'!src/**/*.model.ts',
		'!src/*.ts',
		'!src/**/*.entity.ts',
		'!src/**/*utils.ts',
	],
};

export default config;
