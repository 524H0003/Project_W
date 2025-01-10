/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
    './node_modules/flowbite/**/*.js',
  ],
  darkMode: [
    'variant',
    [
      '@media (prefers-color-scheme: dark) { &:not(.light *) }',
      '&:is(.dark *)',
    ],
  ],
  // eslint-disable-next-line tsPlugin/no-require-imports
  plugins: [require('daisyui'), require('flowbite/plugin')],
  theme: {
    screens: {
      'ih-sm': { raw: '(min-height:640px)' },
      'ah-sm': { raw: '(max-height:639px)' },
      'ih-md': { raw: '(min-height:768px)' },
      'ah-md': { raw: '(max-height:767px)' },
      'ih-lg': { raw: '(min-height:1024px)' },
      'ah-lg': { raw: '(max-height:1023px)' },
      'ih-xl': { raw: '(min-height:1280px)' },
      'ah-xl': { raw: '(max-height:1279px)' },
      'iw-sm': { raw: '(min-width:640px)' },
      'aw-sm': { raw: '(max-width:639px)' },
      'iw-md': { raw: '(min-width:768px)' },
      'aw-md': { raw: '(max-width:767px)' },
      'iw-lg': { raw: '(min-width:1024px)' },
      'aw-lg': { raw: '(max-width:1023px)' },
      'iw-xl': { raw: '(min-width:1280px)' },
      'aw-xl': { raw: '(max-width:1279px)' },
    },
  },
}
