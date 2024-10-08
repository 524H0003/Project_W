module.exports = {
	parser: '@typescript-eslint/parser',
	parserOptions: { project: 'tsconfig.json', sourceType: 'module' },
	plugins: ['@typescript-eslint/eslint-plugin'],
	extends: [
		'plugin:@typescript-eslint/recommended',
		'plugin:prettier/recommended',
	],
	root: true,
	env: { node: true, jest: true },
	ignorePatterns: [
		'*.js',
		'dist/*',
		'*.d.ts',
		'*.config.*',
		'src/types.ts',
		'src/models.ts',
	],
	rules: {
		'@typescript-eslint/interface-name-prefix': 'off',
		'@typescript-eslint/explicit-function-return-type': 'off',
		'@typescript-eslint/explicit-module-boundary-types': 'off',
		'@typescript-eslint/no-explicit-any': 'off',
		'@typescript-eslint/no-floating-promises': 'error',
		'@typescript-eslint/require-await': 'error',
		'@typescript-eslint/no-unused-vars': 'error',
		'@typescript-eslint/ban-types': 'off',
	},
};
