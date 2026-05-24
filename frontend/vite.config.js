import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: path.resolve(__dirname, '../backend/src/main/resources/static'),
    emptyOutDir: true, // Cleans the target static directory on build
    rollupOptions: {
      output: {
        entryFileNames: 'js/[name].js',
        chunkFileNames: 'js/[name].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name.endsWith('.css')) {
            return 'css/style.css'; // Keep the styling in css/style.css for Spring Security match
          }
          return '[ext]/[name].[ext]';
        }
      }
    }
  },
  server: {
    proxy: {
      '/api': 'http://localhost:8080', // Proxy API calls to Spring Boot during development
      '/uploads': 'http://localhost:8080'
    }
  }
});
