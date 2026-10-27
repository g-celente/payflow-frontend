import { fileURLToPath } from 'node:url';

import type { ProxyOptions } from 'vite';

// One .env at the repository root serves the three apps.
export const ENV_DIR = fileURLToPath(new URL('..', import.meta.url));

// Singletons shared by the Shell and the remotes through Module Federation (one React, one router).
export const shared = {
  react: { singleton: true, requiredVersion: '^19.3.1' },
  'react-dom': { singleton: true, requiredVersion: '^19.3.1' },
  'react-router': { singleton: true, requiredVersion: '^8.5.0' },
  '@tanstack/react-query': { singleton: true, requiredVersion: '^5.105.0' },
  '@payflow/ui': { singleton: true },
  '@payflow/api-client': { singleton: true },
};

// Local stand-in for the API Gateway: /api/* goes to the BFF without the prefix, with the gateway secret.
export function bffProxy(env: Record<string, string>): Record<string, ProxyOptions> {
  const secret = env.GATEWAY_ORIGIN_SECRET;
  return {
    '/api': {
      target: env.BFF_DEV_URL || 'http://localhost:3000',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, ''),
      ...(secret ? { headers: { 'x-gateway-secret': secret } } : {}),
    },
  };
}
