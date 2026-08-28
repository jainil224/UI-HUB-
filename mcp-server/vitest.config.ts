import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    testTimeout: 30000,
    hookTimeout: 30000,
  },
  resolve: {
    // Ensure .js imports resolve to .ts during testing via tsx/vitest
    extensions: ['.ts', '.js'],
  },
});
