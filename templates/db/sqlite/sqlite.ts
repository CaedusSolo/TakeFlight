// src/db/sqlite.ts
import Database from "better-sqlite3"
import "dotenv/config"

if (!process.env.SQLITE_DB_PATH) {
  throw new Error("SQLITE_DB_PATH missing in .env")
}

export const db = new Database(process.env.SQLITE_DB_PATH);
db.pragma("journal_mode = WAL")
db.pragma("foreign_keys = ON")

export function query<T = any>(sql: string, params?: any[]): T[] {
  try {
    return db.prepare(sql).all(params) as T[]
  } catch (error) {
    console.error("SQLite query failed:", error)
    throw error
  }
}

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE
  )
`)