import { federation } from '@module-federation/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

import { bffProxy, ENV_DIR, shared } from '../../tooling/vite-shared.ts';

// Remote. O `base` é absoluto porque os arquivos são baixados pela página do Shell (outra origem).
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ENV_DIR, '');
  return {
    envDir: ENV_DIR,
    base: env.MFE_ACCOUNT_BASE || 'http://localhost:5175/',
    plugins: [
      react(),
      federation({
        name: 'mfe_account',
        filename: 'remoteEntry.js',
        exposes: { './AccountApp': './src/AccountApp.tsx' },
        shared,
        dts: false,
      }),
    ],
    server: { port: 5175, strictPort: true, origin: 'http://localhost:5175', cors: true, proxy: bffProxy(env) },
    preview: { port: 5175, strictPort: true, cors: true, proxy: bffProxy(env) },
    build: { target: 'esnext' },
  };
});
