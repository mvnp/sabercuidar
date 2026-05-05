import "dotenv/config";
import postgres from "postgres";

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);

async function listTables() {
  try {
    const res = await client`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`;
    console.log(res);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

listTables();
