import "dotenv/config";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { sql } from "drizzle-orm";

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
const db = drizzle(client);

async function inspectTables() {
  try {
    console.log("🔍 Inspecting tables...");
    
    const tables = ["estabelecimentos", "cidades"];
    for (const table of tables) {
      console.log(`\n--- Table: ${table} ---`);
      const columns = await db.execute(sql`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = ${table}
      `);
      console.log(JSON.stringify(columns, null, 2));
    }
    
    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

inspectTables();
