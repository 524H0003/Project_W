import type { Config } from 'jest';

const config: Config = {
	testEnvironment: 'node',
	detectOpenHandles: true,
	moduleDirectories: ['node_modules', 'src'],
	transform: { '^.+.tsx?$': ['ts-jest', {}] },
	testMatch: ['**/?(*.)+(controller.spec).ts'],
	reporters: [
		'default',
		['github-actions', { silent: false }],
		[
			'jest-junit',
			{ outputDirectory: 'reports', outputName: 'controller.xml' },
		],
	],
	collectCoverage: true,
	coverageReporters: [['text', { file: 'controller.txt' }]],
	collectCoverageFrom: [
		'src/**/*.ts',
		'!src/**/*.resolver.ts',
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
