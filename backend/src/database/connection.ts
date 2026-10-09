import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import path from 'path';
import fs from 'fs';
import * as schema from './schema/index.js';

const candidatePaths = [
  process.env.DATABASE_FILE,
  path.resolve(process.cwd(), 'data', 'jaspion.db'),
  path.resolve(process.cwd(), '..', 'data', 'jaspion.db'),
  'C:\\Apps\\Jaspion\\data\\jaspion.db',
  'C:\\Jaspion\\data\\jaspion.db'
].filter(Boolean) as string[];

const existingPath = candidatePaths.find(p => fs.existsSync(p));
const dbFilePath = existingPath || candidatePaths[1] || 'C:\\Apps\\Jaspion\\data\\jaspion.db';

const dbDir = path.dirname(dbFilePath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

export const sqliteClient = createClient({
  url: `file:${dbFilePath}`
});

export const db = drizzle(sqliteClient, { schema });
