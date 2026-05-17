import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { ViteMinifyPlugin } from 'vite-plugin-minify';
import fs from 'fs';
import path from 'path';

function copyPublicSafe(src: string, dest: string) {
  try {
    const entries = fs.readdirSync(src, { withFileTypes: true });
    fs.mkdirSync(dest, { recursive: true });
    for (const entry of entries) {
      // skip files with spaces in name (known broken locked files)
      if (entry.name.includes(' ')) continue;
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      try {
        if (entry.isDirectory()) {
          copyPublicSafe(srcPath, destPath);
        } else {
          fs.copyFileSync(srcPath, destPath);
        }
      } catch {
        // skip any other unreadable files
      }
    }
  } catch {
    // skip unreadable dirs
  }
}

const safePublicDir = resolve(__dirname, '.public-safe');
copyPublicSafe(resolve(__dirname, 'public'), safePublicDir);

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
  publicDir: safePublicDir,
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
        faq: resolve(__dirname, 'faq.html'),
        privacy: resolve(__dirname, 'privacy.html'),
        terms: resolve(__dirname, 'terms.html'),
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
        'gutterglove-vs-leaffilter': resolve(__dirname, 'gutterglove-vs-leaffilter.html'),
        'gutter-guard-cost-cherry-hill-nj': resolve(__dirname, 'gutter-guard-cost-cherry-hill-nj.html'),
        'oelo-vs-gemstone-vs-trimlight': resolve(__dirname, 'oelo-vs-gemstone-vs-trimlight.html'),
        'permanent-lights-cost-south-jersey': resolve(__dirname, 'permanent-lights-cost-south-jersey.html'),
        'gutter-guard-roi-south-jersey': resolve(__dirname, 'gutter-guard-roi-south-jersey.html'),
        'permanent-lights-vs-christmas-lights': resolve(__dirname, 'permanent-lights-vs-christmas-lights.html'),
        'best-gutter-guards-pine-needles-nj': resolve(__dirname, 'best-gutter-guards-pine-needles-nj.html'),
        'outdoor-lighting-home-security-nj': resolve(__dirname, 'outdoor-lighting-home-security-nj.html'),
        'south-jersey-storm-season-gutter-prep': resolve(__dirname, 'south-jersey-storm-season-gutter-prep.html'),
        'service-areas/alloway-nj': resolve(__dirname, 'service-areas/alloway-nj.html'),
        'service-areas/atlantic-city-nj': resolve(__dirname, 'service-areas/atlantic-city-nj.html'),
        'service-areas/beachwood-nj': resolve(__dirname, 'service-areas/beachwood-nj.html'),
        'service-areas/bear-de': resolve(__dirname, 'service-areas/bear-de.html'),
        'service-areas/bensalem-pa': resolve(__dirname, 'service-areas/bensalem-pa.html'),
        'service-areas/brick-nj': resolve(__dirname, 'service-areas/brick-nj.html'),
        'service-areas/brigantine-nj': resolve(__dirname, 'service-areas/brigantine-nj.html'),
        'service-areas/bristol-pa': resolve(__dirname, 'service-areas/bristol-pa.html'),
        'service-areas/bryn-mawr-pa': resolve(__dirname, 'service-areas/bryn-mawr-pa.html'),
        'service-areas/burlington-nj': resolve(__dirname, 'service-areas/burlington-nj.html'),
        'service-areas/camden-nj': resolve(__dirname, 'service-areas/camden-nj.html'),
        'service-areas/cape-may-court-house-nj': resolve(__dirname, 'service-areas/cape-may-court-house-nj.html'),
        'service-areas/cape-may-nj': resolve(__dirname, 'service-areas/cape-may-nj.html'),
        'service-areas/carneys-point-nj': resolve(__dirname, 'service-areas/carneys-point-nj.html'),
        'service-areas/cherry-hill-nj': resolve(__dirname, 'service-areas/cherry-hill-nj.html'),
        'service-areas/chester-pa': resolve(__dirname, 'service-areas/chester-pa.html'),
        'service-areas/collingswood-nj': resolve(__dirname, 'service-areas/collingswood-nj.html'),
        'service-areas/downingtown-pa': resolve(__dirname, 'service-areas/downingtown-pa.html'),
        'service-areas/doylestown-pa': resolve(__dirname, 'service-areas/doylestown-pa.html'),
        'service-areas/egg-harbor-township-nj': resolve(__dirname, 'service-areas/egg-harbor-township-nj.html'),
        'service-areas/exton-pa': resolve(__dirname, 'service-areas/exton-pa.html'),
        'service-areas/florence-nj': resolve(__dirname, 'service-areas/florence-nj.html'),
        'service-areas/freehold-nj': resolve(__dirname, 'service-areas/freehold-nj.html'),
        'service-areas/glassboro-nj': resolve(__dirname, 'service-areas/glassboro-nj.html'),
        'service-areas/haddonfield-nj': resolve(__dirname, 'service-areas/haddonfield-nj.html'),
        'service-areas/hamilton-nj': resolve(__dirname, 'service-areas/hamilton-nj.html'),
        'service-areas/hammonton-nj': resolve(__dirname, 'service-areas/hammonton-nj.html'),
        'service-areas/howell-nj': resolve(__dirname, 'service-areas/howell-nj.html'),
        'service-areas/jackson-nj': resolve(__dirname, 'service-areas/jackson-nj.html'),
        'service-areas/king-of-prussia-pa': resolve(__dirname, 'service-areas/king-of-prussia-pa.html'),
        'service-areas/lawrenceville-nj': resolve(__dirname, 'service-areas/lawrenceville-nj.html'),
        'service-areas/levittown-pa': resolve(__dirname, 'service-areas/levittown-pa.html'),
        'service-areas/manchester-township-nj': resolve(__dirname, 'service-areas/manchester-township-nj.html'),
        'service-areas/marlton-nj': resolve(__dirname, 'service-areas/marlton-nj.html'),
        'service-areas/mays-landing-nj': resolve(__dirname, 'service-areas/mays-landing-nj.html'),
        'service-areas/medford-nj': resolve(__dirname, 'service-areas/medford-nj.html'),
        'service-areas/media-pa': resolve(__dirname, 'service-areas/media-pa.html'),
        'service-areas/middletown-de': resolve(__dirname, 'service-areas/middletown-de.html'),
        'service-areas/moorestown-nj': resolve(__dirname, 'service-areas/moorestown-nj.html'),
        'service-areas/mount-ephraim-nj': resolve(__dirname, 'service-areas/mount-ephraim-nj.html'),
        'service-areas/mount-laurel-nj': resolve(__dirname, 'service-areas/mount-laurel-nj.html'),
        'service-areas/mullica-hill-nj': resolve(__dirname, 'service-areas/mullica-hill-nj.html'),
        'service-areas/new-castle-de': resolve(__dirname, 'service-areas/new-castle-de.html'),
        'service-areas/newark-de': resolve(__dirname, 'service-areas/newark-de.html'),
        'service-areas/norristown-pa': resolve(__dirname, 'service-areas/norristown-pa.html'),
        'service-areas/ocean-city-nj': resolve(__dirname, 'service-areas/ocean-city-nj.html'),
        'service-areas/paulsboro-nj': resolve(__dirname, 'service-areas/paulsboro-nj.html'),
        'service-areas/pemberton-nj': resolve(__dirname, 'service-areas/pemberton-nj.html'),
        'service-areas/pennsauken-nj': resolve(__dirname, 'service-areas/pennsauken-nj.html'),
        'service-areas/philadelphia-pa': resolve(__dirname, 'service-areas/philadelphia-pa.html'),
        'service-areas/princeton-nj': resolve(__dirname, 'service-areas/princeton-nj.html'),
        'service-areas/salem-nj': resolve(__dirname, 'service-areas/salem-nj.html'),
        'service-areas/sewell-nj': resolve(__dirname, 'service-areas/sewell-nj.html'),
        'service-areas/springfield-pa': resolve(__dirname, 'service-areas/springfield-pa.html'),
        'service-areas/toms-river-nj': resolve(__dirname, 'service-areas/toms-river-nj.html'),
        'service-areas/trenton-nj': resolve(__dirname, 'service-areas/trenton-nj.html'),
        'service-areas/upper-darby-pa': resolve(__dirname, 'service-areas/upper-darby-pa.html'),
        'service-areas/voorhees-nj': resolve(__dirname, 'service-areas/voorhees-nj.html'),
        'service-areas/west-chester-pa': resolve(__dirname, 'service-areas/west-chester-pa.html'),
        'service-areas/wildwood-nj': resolve(__dirname, 'service-areas/wildwood-nj.html'),
        'service-areas/willingboro-nj': resolve(__dirname, 'service-areas/willingboro-nj.html'),
        'service-areas/willow-grove-pa': resolve(__dirname, 'service-areas/willow-grove-pa.html'),
        'service-areas/wilmington-de': resolve(__dirname, 'service-areas/wilmington-de.html'),
        'service-areas/woodbury-nj': resolve(__dirname, 'service-areas/woodbury-nj.html'),
      },
    },
  },
});
