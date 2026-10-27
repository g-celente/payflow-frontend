import { fileURLToPath } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

// Testes de componente: jsdom, sem Module Federation (os testes não importam os remotes).
export function componentTests() {
  return defineConfig({
    plugins: [react()],
    test: {
      environment: 'jsdom',
      setupFiles: [fileURLToPath(new URL('./vitest-setup.ts', import.meta.url))],
      include: ['test/**/*.test.{ts,tsx}'],
    },
  });
}
