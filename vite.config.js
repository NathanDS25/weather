import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  root: path.resolve(__dirname, 'weatherapp'),
  build: {
    outDir: path.resolve(__dirname, 'dist'),
    target: 'es2020',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'weatherapp'),
    },
  },
});
