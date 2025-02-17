import { fileURLToPath, URL } from 'node:url';
import basicSsl from '@vitejs/plugin-basic-ssl';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { globFuncs } from 'project-w-backend';

// https://vite.dev/config/
export default defineConfig({
  plugins: [basicSsl(), vue()],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  build: { outDir: '../src/app/page' },
  define: {
    global: { ...globFuncs },
  },
});
