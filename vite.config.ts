import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const isDev = mode === 'development';
    
    return {
      base: '/',
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      // SECURITY: Removed API keys from define - they should NEVER be in frontend code
      // API keys are now server-side only (in Supabase Edge Functions)
      define: {
        // Only safe, public configuration should be here
        // All API keys moved to backend Edge Functions
        __DEV__: isDev,
      },
      envPrefix: 'VITE_',
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      optimizeDeps: {
        include: ['@heroicons/react']
      },
      build: {
        // Security: Remove console logs in production
        minify: 'terser',
        terserOptions: {
          compress: {
            // Remove console.* calls in production
            drop_console: !isDev,
            drop_debugger: true,
          },
        },
        // Security: Don't generate source maps in production (prevents code inspection)
        sourcemap: isDev,
      },
    };
});
