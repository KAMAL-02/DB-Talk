import "dotenv/config";
import { defineConfig } from "drizzle-kit";

console.log("DB url:", process.env.DB_COPILOT_URL);

export default defineConfig ({
  schema: "./src/db/schema/*.ts",
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DB_COPILOT_URL!,
  },
});