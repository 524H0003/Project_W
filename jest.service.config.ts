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
		['jest-junit', { outputDirectory: 'reports', outputName: 'service.xml' }],
	],
	collectCoverage: true,
	coverageReporters: [['text', { file: 'service.txt' }]],
	collectCoverageFrom: [
		'src/**/*.service.ts',
	],
};

export default config;
