import { Pool, PoolConfig } from "pg"
import "dotenv/config"

const config = {
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
}

export const pool = new Pool(config)


pool.on('connect', () => console.log("Connected to PostgreSQL"))
pool.on('error', (err) => console.error('PostgreSQL Error: Client Error', err))
