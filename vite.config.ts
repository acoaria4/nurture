import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({ plugins: [react()], base: './', ssr: { noExternal: ['gsap', 'lenis'] }, build: { target: 'es2022' } });

