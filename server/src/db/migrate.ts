import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db } from "./index.js";

// Caminho relativo ao diretório atual (dentro do contêiner)
await migrate(db, { migrationsFolder: "./drizzle/migrations" });
console.log("Migrações concluídas!");
