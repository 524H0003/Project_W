import tsEslintPlugin from '@typescript-eslint/eslint-plugin';
import tsEslintParser from '@typescript-eslint/parser';

export default [
	{
		plugins: {
			tsEslint: tsEslintPlugin,
		},
		languageOptions: {
			parser: tsEslintParser,
			parserOptions: {
				projectService: true,
				project: './tsconfig.json',
				sourceType: 'commonjs',
			},
		},
		rules: {
			'tsEslint/no-explicit-any': 'off',
			'tsEslint/no-floating-promises': 'error',
			'tsEslint/require-await': 'error',
			'tsEslint/no-unused-vars': 'error',
		},
		files: ['src/**/*.ts'],
		ignores: ['**/*.js', '**/*.d.ts', 'src/build/*'],
	},
];
