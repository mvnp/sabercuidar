import { db } from "./src/db";
import { sql } from "drizzle-orm";

async function check() {
  try {
    const result = await db.execute(sql`
      SELECT count(*) FROM sabercuidar.saved_searches;
    `);
    console.log("Saved searches count:", result);
    
    const columns = await db.execute(sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'sabercuidar' AND table_name = 'saved_searches';
    `);
    console.log("Columns:", columns);
  } catch (error) {
    console.error("Check failed:", error);
  }
  process.exit(0);
}

check();
