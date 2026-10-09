import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import path from 'path';
import fs from 'fs';
import * as schema from './schema/index.js';

const dbFilePath = 'C:\\Jaspion\\data\\jaspion.db';
const dbDir = path.dirname(dbFilePath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

export const sqliteClient = createClient({
  url: `file:${dbFilePath}`
});

export const db = drizzle(sqliteClient, { schema });
