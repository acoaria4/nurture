import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        website: fileURLToPath(new URL('./index.html', import.meta.url)),
        model: fileURLToPath(new URL('./model-preview/index.html', import.meta.url)),
        photos: fileURLToPath(new URL('./model-preview/photos.html', import.meta.url)),
      },
    },
  },
});
