import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';
import viteTsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    viteTsconfigPaths(),
  ],
  server: {
    port: 3112,
    allowedHosts: ['potat.industries'],
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  optimizeDeps: {
    include: [
      '@/assets/swagger-ui/swagger-ui-es-bundle.js',
      '@/assets/swagger-ui/swagger-ui-standalone-preset.js',
    ],
  },
  build: {
    commonjsOptions: {
      include: [
        /node_modules\/humanize-duration/,
        /node_modules\/tinycolor2/,
        /assets\/swagger-ui\/swagger-ui-es-bundle.js$/,
        /assets\/swagger-ui\/swagger-ui-standalone-preset.js$/,
      ],
    },
  },
});
