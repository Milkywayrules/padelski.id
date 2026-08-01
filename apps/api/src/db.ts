import { type Database, createDb } from "@padelski/db";
import { serverEnv } from "@padelski/env/server";

let dbInstance: Database | null = null;

export function getDb(): Database {
  if (!dbInstance) {
    dbInstance = createDb(serverEnv.DB_URL);
  }
  return dbInstance;
}

export function setDb(db: Database): void {
  dbInstance = db;
}
