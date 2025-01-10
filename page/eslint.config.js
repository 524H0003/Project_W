import pluginVue from 'eslint-plugin-vue'
import vueTsEslintConfig from '@vue/eslint-config-typescript'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'

export default [
  ...pluginVue.configs['flat/essential'],
  ...vueTsEslintConfig(),
  skipFormatting,
  {
    name: 'app/files-to-lint',
    files: ['**/*.{ts,mts,tsx,vue}', '**/tailwind.config.js'],
    plugins: { tsPlugin },
    languageOptions: {
      parser: tsParser,
      parserOptions: { project: 'tsconfig.json', sourceType: 'commonjs' },
    },
  },
  {
    name: 'app/files-to-ignore',
    ignores: ['**/dist/**', '**/dist-ssr/**', '**/coverage/**'],
  },
]
