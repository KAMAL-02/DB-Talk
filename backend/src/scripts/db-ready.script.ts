import { Client } from "pg";

const MAX_RETRIES = 20;
const DELAY_MS = 2000;

async function dbReady() {
  let attempt = 0;

  while (attempt < MAX_RETRIES) {
    try {
      const client = new Client({
        connectionString: process.env.DB_TALK_URL,
      });

      await client.connect();
      await client.query("SELECT 1");
      await client.end();

      console.log("Database is ready");
      process.exit(0);
    } catch (err) {
      attempt++;
      console.log(`Database not ready, retrying (${attempt}/${MAX_RETRIES})`);
      await new Promise((r) => setTimeout(r, DELAY_MS));
    }
  }

  console.error("Database is not ready");
  process.exit(1);
}

dbReady();
