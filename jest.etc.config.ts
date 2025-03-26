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
		'**/*.ts',
		'!**/*.controller.ts',
		'!**/*.resolver.ts',
		'!**/*.service.ts',
		'!**/*.dto.ts',
		'!**/*.model.ts',
		'!**/*.entity.ts',
		'!**/*.module.ts',
	],
	forceExit: true,
};

export default config;
