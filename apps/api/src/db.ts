import { type Database, createDb } from "@padelski/db";

let dbInstance: Database | null = null;

export function getDb(): Database {
  if (!dbInstance) {
    const url = process.env["DB_URL"] ?? "postgresql://padelski:padelski@localhost:5432/padelski";
    dbInstance = createDb(url);
  }
  return dbInstance;
}

export function setDb(db: Database): void {
  dbInstance = db;
}
