import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema.js";

const DB_HOST = process.env.DB_HOST || "db";
const DB_PORT = process.env.DB_PORT || "5432";
const POSTGRES_USER = process.env.POSTGRES_USER || "app_user";
const POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD || "app_secret";
const POSTGRES_DB = process.env.POSTGRES_DB || "brev_db";

const connectionString = `postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${DB_HOST}:${DB_PORT}/${POSTGRES_DB}`;

const pool = new Pool({
  connectionString,
});

console.log("conectado ao banco com:", {
  host: DB_HOST,
  port: DB_PORT,
  user: POSTGRES_USER,
  database: POSTGRES_DB,
});

export const db = drizzle(pool, { schema });
export { schema };
