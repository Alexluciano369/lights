import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { ViteMinifyPlugin } from 'vite-plugin-minify';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    ViteMinifyPlugin({
      minifyCSS: true,
      minifyJS: true,
      removeComments: true,
    }),
  ],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    minify: true,
    cssMinify: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        gutters: resolve(__dirname, 'gutters.html'),
        lighting: resolve(__dirname, 'lighting.html'),
        blog: resolve(__dirname, 'blog.html'),
        reviews: resolve(__dirname, 'reviews.html'),
        services: resolve(__dirname, 'services.html'),
        'permanent-lighting-holiday-transform': resolve(__dirname, 'permanent-lighting-holiday-transform.html'),
        'why-gutter-guards-essential-south-jersey': resolve(__dirname, 'why-gutter-guards-essential-south-jersey.html'),
        'prevent-ice-dams-gutter-guards-south-jersey': resolve(__dirname, 'prevent-ice-dams-gutter-guards-south-jersey.html'),
        'led-outdoor-lighting-energy-savings-guide': resolve(__dirname, 'led-outdoor-lighting-energy-savings-guide.html'),
        'gutter-cleaning-cost-vs-gutter-guards-investment': resolve(__dirname, 'gutter-cleaning-cost-vs-gutter-guards-investment.html'),
        'best-time-install-gutter-guards-south-jersey': resolve(__dirname, 'best-time-install-gutter-guards-south-jersey.html'),
        'permanent-outdoor-lighting-increase-home-value': resolve(__dirname, 'permanent-outdoor-lighting-increase-home-value.html'),
        'gutter-guards-prevent-foundation-damage': resolve(__dirname, 'gutter-guards-prevent-foundation-damage.html'),
        'smart-home-outdoor-lighting-integration-guide': resolve(__dirname, 'smart-home-outdoor-lighting-integration-guide.html'),
        'pine-needles-gutters-micro-mesh-solution': resolve(__dirname, 'pine-needles-gutters-micro-mesh-solution.html'),
        'outdoor-lighting-security-benefits-south-jersey': resolve(__dirname, 'outdoor-lighting-security-benefits-south-jersey.html'),
        'gutter-maintenance-checklist-south-jersey-homeowners': resolve(__dirname, 'gutter-maintenance-checklist-south-jersey-homeowners.html'),
        'outdoor-lighting-color-schemes-every-occasion': resolve(__dirname, 'outdoor-lighting-color-schemes-every-occasion.html'),
        'service-areas/cherry-hill-nj': resolve(__dirname, 'service-areas/cherry-hill-nj.html'),
        'service-areas/haddonfield-nj': resolve(__dirname, 'service-areas/haddonfield-nj.html'),
        'service-areas/mount-laurel-nj': resolve(__dirname, 'service-areas/mount-laurel-nj.html'),
      },
    },
  },
});
