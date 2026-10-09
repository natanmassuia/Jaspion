import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/database/schema/index.ts',
  out: './src/database/migrations',
  dialect: 'sqlite',
  dbCredentials: {
    url: process.env.DATABASE_URL ? (process.env.DATABASE_URL.startsWith('file:') ? process.env.DATABASE_URL : `file:${process.env.DATABASE_URL}`) : 'file:../data/jaspion.db'
  }
});
