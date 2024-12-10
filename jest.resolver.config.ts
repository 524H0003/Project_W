import type { Config } from 'jest';

const config: Config = {
	testEnvironment: 'node',
	detectOpenHandles: true,
	moduleDirectories: ['node_modules', 'src'],
	transform: { '^.+.tsx?$': ['ts-jest', {}] },
	testMatch: ['**/?(*.)+(resolver.spec).ts'],
	reporters: [
		'default',
		['github-actions', { silent: false }],
		['jest-junit', { outputDirectory: 'reports', outputName: 'resolver.xml' }],
	],
	collectCoverage: true,
	coverageReporters: [['text', { file: 'resolver.txt' }]],
	collectCoverageFrom: ['src/**/*.resolver.ts'],
};

export default config;
