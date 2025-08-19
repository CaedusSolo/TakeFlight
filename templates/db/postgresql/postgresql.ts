import { Pool, PoolConfig, QueryResult } from "pg"
import "dotenv/config"


const config: PoolConfig = {
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
}

export const pool = new Pool(config)

pool.on("connect", () => console.log("Connected to PostgreSQL"))
pool.on("error", (err) => console.error("PostgreSQL Error: Client Error", err))


export async function query<T = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
  return pool.query<T>(text, params)
}