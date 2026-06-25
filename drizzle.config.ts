import { defineConfig } from 'drizzle-kit';

const url = process.env.TURSO_DATABASE_URL ?? 'file:./local.db';
const authToken = process.env.TURSO_AUTH_TOKEN;

export default defineConfig({
  dialect: 'turso',
  schema: './db/schema.ts',
  out: './db/migrations',
  dbCredentials: {
    url,
    ...(authToken ? { authToken } : {}),
  },
  strict: true,
  verbose: true,
});
