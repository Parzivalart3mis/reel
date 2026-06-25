import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    include: [
      'tests/unit/**/*.test.{ts,tsx}',
      'tests/integration/**/*.test.ts',
    ],
    setupFiles: ['tests/setup.ts'],
    coverage: {
      provider: 'v8',
      include: ['lib/**/*.{ts,tsx}'],
      exclude: [
        'lib/**/*.d.ts',
        'lib/recommend.ts', // streams an LLM response; covered by route + manual QA
        'lib/client.ts', // browser fetch wrapper, exercised by e2e
        'lib/events.ts', // browser-only window event helpers
        'lib/auth.ts', // thin Clerk wrapper, mocked in integration tests
        'lib/ratelimit.ts', // Upstash wrapper, disabled without Redis
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        statements: 80,
        branches: 70,
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./', import.meta.url)),
    },
  },
});
