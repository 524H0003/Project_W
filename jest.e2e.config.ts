import type { Config } from 'jest';

const config: Config = {
	testEnvironment: 'node',
	testMatch: ['**/?(*.)+(controller.spec).ts'],
	detectOpenHandles: true,
	moduleDirectories: ['node_modules', 'src'],
	transform: { '^.+.tsx?$': ['ts-jest', {}] },
	reporters: [
		'default',
		['github-actions', { silent: false }],
		['jest-junit', { outputDirectory: 'reports_e2e', outputName: 'junit.xml' }],
	],
	collectCoverage: true,
	coverageReporters: [['text', { file: 'coverage_e2e.txt' }]],
	collectCoverageFrom: [
		'src/**/*.ts',
		'!src/**/*.module.ts',
		'!src/models.ts',
		'!src/**/*.spec.ts',
		'!src/**/*.model.ts',
		'!src/*.ts',
		'!src/**/*.entity.ts',
		'!src/**/*.resolver.ts',
		'!src/**/*utils.ts',
	],
};

export default config;
