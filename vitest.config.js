import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.jsx'],
    include: ['src/**/*.{test,spec}.{js,jsx}'],
    exclude: ['.kilo/**', 'dist/**', 'build/**', 'node_modules/**'],
    css: true,
    restoreMocks: true,
    clearMocks: true,
  },
});
