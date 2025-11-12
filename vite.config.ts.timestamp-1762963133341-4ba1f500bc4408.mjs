// vite.config.ts
import { defineConfig } from "file:///home/project/node_modules/vite/dist/node/index.js";
import react from "file:///home/project/node_modules/@vitejs/plugin-react/dist/index.mjs";
import { resolve } from "path";
import { ViteMinifyPlugin } from "file:///home/project/node_modules/vite-plugin-minify/dist/index.cjs";
var __vite_injected_original_dirname = "/home/project";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    ViteMinifyPlugin({
      minifyCSS: true,
      minifyJS: true,
      removeComments: true
    })
  ],
  optimizeDeps: {
    exclude: ["lucide-react"]
  },
  build: {
    minify: true,
    cssMinify: true,
    rollupOptions: {
      input: {
        main: resolve(__vite_injected_original_dirname, "index.html"),
        gutters: resolve(__vite_injected_original_dirname, "gutters.html"),
        lighting: resolve(__vite_injected_original_dirname, "lighting.html"),
        blog: resolve(__vite_injected_original_dirname, "blog.html"),
        reviews: resolve(__vite_injected_original_dirname, "reviews.html"),
        "permanent-lighting-holiday-transform": resolve(__vite_injected_original_dirname, "permanent-lighting-holiday-transform.html"),
        "why-gutter-guards-essential-south-jersey": resolve(__vite_injected_original_dirname, "why-gutter-guards-essential-south-jersey.html")
      }
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XG5pbXBvcnQgeyByZXNvbHZlIH0gZnJvbSAncGF0aCc7XG5pbXBvcnQgeyBWaXRlTWluaWZ5UGx1Z2luIH0gZnJvbSAndml0ZS1wbHVnaW4tbWluaWZ5JztcblxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHBsdWdpbnM6IFtcbiAgICByZWFjdCgpLFxuICAgIFZpdGVNaW5pZnlQbHVnaW4oe1xuICAgICAgbWluaWZ5Q1NTOiB0cnVlLFxuICAgICAgbWluaWZ5SlM6IHRydWUsXG4gICAgICByZW1vdmVDb21tZW50czogdHJ1ZSxcbiAgICB9KSxcbiAgXSxcbiAgb3B0aW1pemVEZXBzOiB7XG4gICAgZXhjbHVkZTogWydsdWNpZGUtcmVhY3QnXSxcbiAgfSxcbiAgYnVpbGQ6IHtcbiAgICBtaW5pZnk6IHRydWUsXG4gICAgY3NzTWluaWZ5OiB0cnVlLFxuICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgIGlucHV0OiB7XG4gICAgICAgIG1haW46IHJlc29sdmUoX19kaXJuYW1lLCAnaW5kZXguaHRtbCcpLFxuICAgICAgICBndXR0ZXJzOiByZXNvbHZlKF9fZGlybmFtZSwgJ2d1dHRlcnMuaHRtbCcpLFxuICAgICAgICBsaWdodGluZzogcmVzb2x2ZShfX2Rpcm5hbWUsICdsaWdodGluZy5odG1sJyksXG4gICAgICAgIGJsb2c6IHJlc29sdmUoX19kaXJuYW1lLCAnYmxvZy5odG1sJyksXG4gICAgICAgIHJldmlld3M6IHJlc29sdmUoX19kaXJuYW1lLCAncmV2aWV3cy5odG1sJyksXG4gICAgICAgICdwZXJtYW5lbnQtbGlnaHRpbmctaG9saWRheS10cmFuc2Zvcm0nOiByZXNvbHZlKF9fZGlybmFtZSwgJ3Blcm1hbmVudC1saWdodGluZy1ob2xpZGF5LXRyYW5zZm9ybS5odG1sJyksXG4gICAgICAgICd3aHktZ3V0dGVyLWd1YXJkcy1lc3NlbnRpYWwtc291dGgtamVyc2V5JzogcmVzb2x2ZShfX2Rpcm5hbWUsICd3aHktZ3V0dGVyLWd1YXJkcy1lc3NlbnRpYWwtc291dGgtamVyc2V5Lmh0bWwnKSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUF5TixTQUFTLG9CQUFvQjtBQUN0UCxPQUFPLFdBQVc7QUFDbEIsU0FBUyxlQUFlO0FBQ3hCLFNBQVMsd0JBQXdCO0FBSGpDLElBQU0sbUNBQW1DO0FBTXpDLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVM7QUFBQSxJQUNQLE1BQU07QUFBQSxJQUNOLGlCQUFpQjtBQUFBLE1BQ2YsV0FBVztBQUFBLE1BQ1gsVUFBVTtBQUFBLE1BQ1YsZ0JBQWdCO0FBQUEsSUFDbEIsQ0FBQztBQUFBLEVBQ0g7QUFBQSxFQUNBLGNBQWM7QUFBQSxJQUNaLFNBQVMsQ0FBQyxjQUFjO0FBQUEsRUFDMUI7QUFBQSxFQUNBLE9BQU87QUFBQSxJQUNMLFFBQVE7QUFBQSxJQUNSLFdBQVc7QUFBQSxJQUNYLGVBQWU7QUFBQSxNQUNiLE9BQU87QUFBQSxRQUNMLE1BQU0sUUFBUSxrQ0FBVyxZQUFZO0FBQUEsUUFDckMsU0FBUyxRQUFRLGtDQUFXLGNBQWM7QUFBQSxRQUMxQyxVQUFVLFFBQVEsa0NBQVcsZUFBZTtBQUFBLFFBQzVDLE1BQU0sUUFBUSxrQ0FBVyxXQUFXO0FBQUEsUUFDcEMsU0FBUyxRQUFRLGtDQUFXLGNBQWM7QUFBQSxRQUMxQyx3Q0FBd0MsUUFBUSxrQ0FBVywyQ0FBMkM7QUFBQSxRQUN0Ryw0Q0FBNEMsUUFBUSxrQ0FBVywrQ0FBK0M7QUFBQSxNQUNoSDtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
