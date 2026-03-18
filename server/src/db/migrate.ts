import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db, pool } from "./index.js";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigrations() {
  console.log("Iniciando a migração do banco de dados...");

  try {
    const possiblePaths = [
      path.join(__dirname, "../../drizzle/migrations"),
      path.join(__dirname, "../../../drizzle/migrations"),
      path.join(process.cwd(), "drizzle/migrations"),
      path.join(process.cwd(), "../drizzle/migrations"),
      "/usr/src/app/drizzle/migrations",
      "/usr/src/app/server/drizzle/migrations",
    ];

    let migrationsFolder = null;

    for (const testPath of possiblePaths) {
      if (fs.existsSync(testPath)) {
        migrationsFolder = testPath;

        const files = fs.readdirSync(testPath);

        if (fs.existsSync(path.join(testPath, "meta"))) {
          const metaFiles = fs.readdirSync(path.join(testPath, "meta"));
        }
        break;
      }
    }

    if (!migrationsFolder) {
      if (fs.existsSync("/usr/src/app/server")) {
        console.log("Conteúdo de /usr/src/app/server:");
        console.log(fs.readdirSync("/usr/src/app/server"));
      }

      throw new Error("Pasta de migrações não encontrada");
    }

    await migrate(db, { migrationsFolder });

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
