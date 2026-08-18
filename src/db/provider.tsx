import migrations from '@/drizzle/migrations';
import { migrate } from 'drizzle-orm/expo-sqlite/migrator';
import { SQLiteProvider, useSQLiteContext, type SQLiteDatabase } from 'expo-sqlite';
import { createContext, type PropsWithChildren, useContext, useState } from 'react';

import { createDatabase, DATABASE_NAME, type Database } from './client';
import { generateDueRecurringExpenses } from './automation';

const DatabaseContext = createContext<Database | null>(null);

async function initializeDatabase(client: SQLiteDatabase) {
  await client.execAsync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
  const database = createDatabase(client);
  await migrate(database, migrations);
  await generateDueRecurringExpenses(database);
}

function DrizzleProvider({ children }: PropsWithChildren) {
  const sqlite = useSQLiteContext();
  const [database] = useState(() => createDatabase(sqlite));

  return (
    <DatabaseContext.Provider value={database}>
      {children}
    </DatabaseContext.Provider>
  );
}

export function DatabaseProvider({ children }: PropsWithChildren) {
  return (
    <SQLiteProvider
      databaseName={DATABASE_NAME}
      onInit={initializeDatabase}
      options={{ enableChangeListener: true }}>
      <DrizzleProvider>{children}</DrizzleProvider>
    </SQLiteProvider>
  );
}

export function useDatabase(): Database {
  const database = useContext(DatabaseContext);

  if (!database) {
    throw new Error('useDatabase must be used within DatabaseProvider');
  }

  return database;
}