import Database from "better-sqlite3"
import "dotenv/config"


export const db = new Database(process.env.SQLITE_DB_PATH)
db.pragma('journal_mode = WAL')
db.pragma("foreign_keys = ON")


export function query(sql, params) {
  try {
    return db.prepare(sql).all(params)
  }
  catch (error) {
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