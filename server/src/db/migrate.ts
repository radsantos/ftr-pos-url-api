import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db, pool } from "./index.js";

async function runMigrations() {
  console.log("⏳ Iniciando a migração do banco de dados...");

  try {
    await migrate(db, { migrationsFolder: "./server/drizzle/migrations" });

    console.log("Migração executada com sucesso!");
  } catch (error) {
    console.error("Erro fatal durante a migração:", error);
    process.exit(1);
  } finally {
    console.log("Fechando a conexão com o banco de dados...");
    await pool.end();
  }
}

runMigrations();
