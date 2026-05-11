import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";

dotenv.config();

if (!process.env["DATABASE_URL"]) {
  throw new Error("Environment Setup Error");
}
const sql = neon(process.env["DATABASE_URL"]);
export const db = drizzle(sql);
