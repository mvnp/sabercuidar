import { db } from "../src/db";
import { sql } from "drizzle-orm";

async function checkColumns() {
  try {
    const result = await db.execute(sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'empresas'
    `);
    console.log("Columns in public.empresas:", result);
  } catch (err) {
    console.error("Error checking columns:", err);
  }
}

checkColumns();
