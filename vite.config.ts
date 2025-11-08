import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        gutters: resolve(__dirname, 'gutters.html'),
        lighting: resolve(__dirname, 'lighting.html'),
        blog: resolve(__dirname, 'blog.html'),
        reviews: resolve(__dirname, 'reviews.html'),
        'permanent-lighting-holiday-transform': resolve(__dirname, 'permanent-lighting-holiday-transform.html'),
        'why-gutter-guards-essential-south-jersey': resolve(__dirname, 'why-gutter-guards-essential-south-jersey.html'),
      },
    },
  },
});
