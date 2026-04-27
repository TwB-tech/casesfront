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
        'import.meta.env.APPWRITE_ENDPOINT': JSON.stringify(
          env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1'
        ),
        'import.meta.env.APPWRITE_PROJECT_ID': JSON.stringify(env.APPWRITE_PROJECT_ID || ''),
        'import.meta.env.APPWRITE_DATABASE_ID': JSON.stringify(env.APPWRITE_DATABASE_ID || 'default'),
        'import.meta.env.RESEND_API_KEY': JSON.stringify(env.RESEND_API_KEY || ''),
        'import.meta.env.ADMIN_EMAIL': JSON.stringify(env.ADMIN_EMAIL || 'admin@techwithbrands.com'),
        'import.meta.env.NOREPLY_EMAIL': JSON.stringify(env.NOREPLY_EMAIL || 'noreply@techwithbrands.com'),
        'import.meta.env.SITE_URL': JSON.stringify(env.SITE_URL || 'http://localhost:3000'),
      },
  };
});
