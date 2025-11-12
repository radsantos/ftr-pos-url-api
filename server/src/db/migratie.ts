import "dotenv/config";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db } from "./db";

async function runMigrations() {
  console.log("Iniciando migrações...");

  try {
    await migrate(db, { migrationsFolder: "./drizzle/migrations" });

    console.log("Migrações concluídas com sucesso!");
  } catch (error) {
    console.error("Erro ao executar migrações:", error);
    process.exit(1);
  } finally {
    // @ts-ignore
    db.session.client.end();
  }
}

runMigrations();
