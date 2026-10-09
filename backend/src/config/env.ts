import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(6171),
  HOST: z.string().default('0.0.0.0'),
  DATABASE_URL: z.string().default('../data/jaspion.db'),
  SESSION_SECRET: z.string().default('chave-super-secreta-jaspion-cco-dev-32-chars!'),
  COOKIE_SECRET: z.string().default('cookie-secret-jaspion-cco-dev-32-chars!'),
  FRONTEND_URL: z.string().default('http://localhost:6172'),
  ZNUNY_MOCK: z.coerce.boolean().default(true),
  ZNUNY_SYNC_INTERVAL_MINUTES: z.coerce.number().default(5)
});

export const env = envSchema.parse(process.env);
