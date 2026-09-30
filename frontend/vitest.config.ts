import { defineConfig } from 'vitest/config';

// Deliberately a separate config from vite.config.ts: the app build applies
// obfuscation and mkcert plugins, which must not process code under test.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
