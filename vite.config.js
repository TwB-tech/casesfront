import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    server: {
      port: 3000,
    },
    oxc: {
      jsx: 'automatic',
    },
    envPrefix: false,
    define: {
      'import.meta.env.DATABASE_MODE': JSON.stringify(env.DATABASE_MODE || ''),
      'import.meta.env.SUPABASE_URL': JSON.stringify(env.SUPABASE_URL || ''),
      'import.meta.env.SUPABASE_ANON_KEY': JSON.stringify(env.SUPABASE_ANON_KEY || ''),
      'import.meta.env.SENTRY_DSN': JSON.stringify(env.SENTRY_DSN || ''),
      'import.meta.env.GA_ID': JSON.stringify(env.GA_ID || ''),
    },
  };
});
