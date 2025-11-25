import "dotenv/config";
import type { Config } from "drizzle-kit";

export default {
  dialect: "postgresql",
  schema: "./server/src/db/schema.ts",
  out: "./server/drizzle/migrations",
  dbCredentials: {
    host: process.env.DB_HOST || "db",
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.POSTGRES_USER || "app_user",
    password: process.env.POSTGRES_PASSWORD || "app_secret",
    database: process.env.POSTGRES_DB || "brev_db",
  },
  verbose: true,
  strict: true,
} satisfies Config;
