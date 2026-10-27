import { federation } from '@module-federation/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

import { bffProxy, ENV_DIR, shared } from '../../tooling/vite-shared.ts';

// Host. Os endereços do remoteEntry.js de cada remote vêm do ambiente (CloudFront na nuvem).
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ENV_DIR, '');
  return {
    envDir: ENV_DIR,
    base: env.SHELL_BASE || '/',
    plugins: [
      react(),
      federation({
        name: 'shell',
        remotes: {
          mfe_payments: {
            type: 'module',
            name: 'mfe_payments',
            entry: env.VITE_MFE_PAYMENTS_URL || 'http://localhost:5174/remoteEntry.js',
          },
          mfe_account: {
            type: 'module',
            name: 'mfe_account',
            entry: env.VITE_MFE_ACCOUNT_URL || 'http://localhost:5175/remoteEntry.js',
          },
        },
        shared,
        dts: false,
      }),
    ],
    server: { port: 5173, strictPort: true, proxy: bffProxy(env) },
    preview: { port: 5173, strictPort: true, proxy: bffProxy(env) },
    build: { target: 'esnext' },
  };
});
