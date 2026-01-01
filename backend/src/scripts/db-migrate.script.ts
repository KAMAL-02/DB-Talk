import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db } from "../db/db.js";

async function runMigrations() {
  console.log("Running database migrations...");
  await migrate(db, { migrationsFolder: "src/db/migrations" });
  console.log("Migrations completed");
  process.exit(0);
}

runMigrations().catch((err) => {
  console.error("Migration failed", err);
  process.exit(1);
});
