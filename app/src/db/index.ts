import { Pool } from 'pg'

const pgPort: number = Number(process.env.POSTGRES_PORT) || 5432

const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  port: pgPort,
  database: process.env.POSTGRES_DB
})

export default pool
