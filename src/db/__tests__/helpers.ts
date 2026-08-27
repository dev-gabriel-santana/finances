import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import type { Database } from "../client";
import * as schema from "../schema";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_FOLDER = path.resolve(__dirname, "../../../drizzle");

export interface TestDb {
  db: Database;
  /** Remove o arquivo temporário ao final do bloco de testes. */
  cleanup: () => void;
}

/**
 * Cria um banco SQLite em arquivo temporário com as migrations aplicadas.
 * Usar arquivo em vez de :memory: porque o @libsql/client cria uma nova
 * conexão após cada transaction(), o que apagaria o banco em memória.
 */
export async function createTestDb(): Promise<TestDb> {
  const tmpDir = mkdtempSync(path.join(tmpdir(), "finances-test-"));
  const dbPath = path.join(tmpDir, "test.db");
  const client = createClient({ url: `file:${dbPath}` });
  const db = drizzle(client, { schema });
  await migrate(db, { migrationsFolder: MIGRATIONS_FOLDER });
  return {
    db: db as unknown as Database,
    cleanup: () => rmSync(tmpDir, { recursive: true, force: true }),
  };
}
