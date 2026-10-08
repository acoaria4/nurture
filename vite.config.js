import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  build: {
    rollupOptions: {
      input: fileURLToPath(new URL('./model-preview/index.html', import.meta.url)),
    },
  },
});
