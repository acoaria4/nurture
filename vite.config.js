import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        model: fileURLToPath(new URL('./model-preview/index.html', import.meta.url)),
        photos: fileURLToPath(new URL('./model-preview/photos.html', import.meta.url)),
      },
    },
  },
});
