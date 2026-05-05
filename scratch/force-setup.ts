import "dotenv/config";
import postgres from "postgres";

const client = postgres(process.env.DATABASE_URL!);

async function setup() {
  try {
    console.log("🛠️ Creating saved_searches table in sabercuidar schema...");
    await client.unsafe(`
      CREATE TABLE IF NOT EXISTS sabercuidar.saved_searches (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES sabercuidar.users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        filters TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS saved_searches_user_idx ON sabercuidar.saved_searches(user_id);
    `);
    
    const res = await client.unsafe("SELECT table_name FROM information_schema.tables WHERE table_schema = 'sabercuidar' AND table_name = 'saved_searches'");
    console.log("Verification result:", res);
    
    process.exit(0);
  } catch (err) {
    console.error("FAILED TO CREATE TABLE:", err);
    process.exit(1);
  }
}

setup();
