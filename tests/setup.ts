import '@testing-library/jest-dom/vitest';

// Integration tests run route handlers against an in-memory libSQL instance.
// Set before any module imports `@/db`.
process.env.TURSO_DATABASE_URL = ':memory:';
process.env.TURSO_AUTH_TOKEN = '';
// Disable rate limiting + external services in tests.
process.env.UPSTASH_REDIS_REST_URL = '';
process.env.UPSTASH_REDIS_REST_TOKEN = '';
