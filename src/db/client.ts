import { drizzle, type ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';
import type { SQLiteDatabase } from 'expo-sqlite';

import * as schema from './schema';

export const DATABASE_NAME = 'finances.db';

export type Database = ExpoSQLiteDatabase<typeof schema>;

export function createDatabase(client: SQLiteDatabase): Database {
  return drizzle(client, { schema });
}