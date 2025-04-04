import type { Config } from 'jest';

const config: Config = {
	testEnvironment: 'node',
	detectOpenHandles: true,
	moduleDirectories: ['node_modules', 'src'],
	transform: { '^.+.tsx?$': ['ts-jest', {}] },
	testMatch: [
		'**/?(*.)+(controller.spec).ts',
		'**/?(*.)+(resolver.spec).ts',
		'src/auth/guards/**/*.spec.ts',
	],
	reporters: [
		'default',
		['github-actions', { silent: false }],
		[
			'jest-junit',
			{ outputDirectory: 'reports', outputName: 'requesters.xml' },
		],
	],
	collectCoverage: true,
	coverageReporters: [['text', { file: 'requesters.txt' }]],
	collectCoverageFrom: [
		'src/**/*.controller.ts',
		'src/**/*.resolver.ts',
		'src/auth/guards/**/*',
	],
	forceExit: true,
};

export default config;
