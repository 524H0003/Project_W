import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
	eslint.configs.recommended,
	tseslint.configs.strict,
	{
		languageOptions: {
			parserOptions: {
				projectService: true,
				tsconfigRootDir: import.meta.dirname,
				project: 'tsconfig.json',
				sourceType: 'commonjs',
			},
		},
		rules: {
			'@typescript-eslint/no-floating-promises': 'error',
			'@typescript-eslint/no-unused-vars': 'error',
			'@typescript-eslint/no-extraneous-class': 'off',
			'require-await': 'error',
		},
		files: ['src/**/*.ts'],
		ignores: ['**/*.js', 'src/types.ts', '**/*.d.ts'],
	},
);
