import "dotenv/config";
import postgres from "postgres";

const client = postgres(process.env.DATABASE_URL!);

async function cleanup() {
  try {
    await client.unsafe(`DROP TABLE IF EXISTS sabercuidar.saved_searches CASCADE`);
    console.log("✅ Dropped sabercuidar.saved_searches");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

cleanup();
