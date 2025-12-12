import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:9090',
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@services': path.resolve(__dirname, './src/services'),
      '@contexts': path.resolve(__dirname, './src/contexts'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@theme': path.resolve(__dirname, './src/theme'),
      '@types': path.resolve(__dirname, './src/types'),
      '@assets': path.resolve(__dirname, './src/assets'),
      '@i18n': path.resolve(__dirname, './src/i18n'),
    },
  },
  build: {
    outDir: '../server/public',
    emptyOutDir: true,
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react-router-dom') || id.includes('react-dom') || id.includes('react')) {
              return 'react-vendor';
            }
            if (id.includes('@mui/material')) return 'mui-core';
            if (id.includes('@mui/icons-material')) return 'mui-icons';
            if (id.includes('recharts')) return 'chart-vendor';
            if (id.includes('date-fns')) return 'date-vendor';
            if (id.includes('i18next') || id.includes('react-i18next')) return 'i18n-vendor';
            if (id.includes('socket.io-client')) return 'socket-vendor';
            if (id.includes('axios') || id.includes('js-cookie') || id.includes('jwt-decode')) return 'http-utils';
          }
          return undefined;
        },
      },
    },
  },
});
