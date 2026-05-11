import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { migrate } from "drizzle-orm/neon-http/migrator";
import * as schema from "../db/schema.js";
import dotenv from "dotenv";

dotenv.config();

const sql = neon(process.env["DATABASE_URL"]!);
const db = drizzle(sql, { schema });

async function main() {
  console.log("⏳ Running migrations...");
  await migrate(db, { migrationsFolder: "./drizzle" });
  console.log("✅ Migrations completed!");
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});
