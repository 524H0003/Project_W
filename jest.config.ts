import type { Config } from 'jest';

const config: Config = {
	testEnvironment: 'node',
	detectOpenHandles: true,
	moduleDirectories: ['node_modules', 'src'],
	transform: { '^.+.tsx?$': ['ts-jest', {}] },
	testMatch: ['**/?(*.)+(spec).ts', '!**/?(*.)+(controller.spec).ts'],
	reporters: [
		'default',
		['github-actions', { silent: false }],
		['jest-junit', { outputDirectory: 'reports', outputName: 'junit.xml' }],
	],
	collectCoverage: true,
	coverageReporters: [['text', { file: 'coverage.txt' }]],
	collectCoverageFrom: [
		'src/**/*.ts',
		'!src/**/*.controller.ts',
		'!src/**/*.module.ts',
		'!src/models.ts',
	],
};

export default config;
