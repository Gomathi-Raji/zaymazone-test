import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    allowedHosts: ["zaymazone.up.railway.app"],
    // Proxy API requests to local mock server in development, production backend otherwise
    proxy: {
      '/api': {
        target: mode === 'development' ? 'http://localhost:4000' : 'https://zaymazone-backend.onrender.com',
        changeOrigin: true,
        secure: mode !== 'development',
      }
    }
  },
  plugins: [
    react({
      jsxRuntime: 'automatic'
    }),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve("./src"),
    },
  },
  define: {
    'process.env': {}
  }
}));
