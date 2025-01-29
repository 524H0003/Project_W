import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';

export default [
	{
		name: 'Main',
		files: ['src/**/*.ts'],
		ignores: ['**/*.js', 'src/types.ts', '**/*.d.ts'],
		languageOptions: {
			parser: tsParser,
			parserOptions: { project: 'tsconfig.json', sourceType: 'commonjs' },
		},
		plugins: { tsPlugin },
		rules: {
			'tsPlugin/interface-name-prefix': 'off',
			'tsPlugin/explicit-function-return-type': 'off',
			'tsPlugin/explicit-module-boundary-types': 'off',
			'tsPlugin/no-explicit-any': 'off',
			'tsPlugin/no-floating-promises': 'error',
			'tsPlugin/require-await': 'error',
			'tsPlugin/no-unused-vars': 'error',
			'tsPlugin/ban-types': 'off',
		},
	},
];
