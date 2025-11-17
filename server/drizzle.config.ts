import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",

  schema: "./server/src/db/schema.ts",

  out: "./server/drizzle/migrations",

  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },

  verbose: true,
  strict: true,
});
