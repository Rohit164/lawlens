import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
    base: "/",
  server: {
    host: "::",
    port: 8080,
    open: true,
    proxy: {
      '/streamlit': {
        target: 'http://localhost:8501',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/streamlit/, ''),
        ws: true,
      },
      '/_stcore': {
        target: 'http://localhost:8501',
        changeOrigin: true,
        ws: true,
      },
      '/static': {
        target: 'http://localhost:8501',
        changeOrigin: true,
      },
      '/stream': {
        target: 'http://localhost:8501',
        changeOrigin: true,
        ws: true,
      },
      '/component': {
        target: 'http://localhost:8501',
        changeOrigin: true,
      },
    },
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        entryFileNames: 'index.js',
        chunkFileNames: 'chunk-[name].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return 'index.css';
          }
          return 'asset-[name][extname]';
        },
      },
    },
  },
}));
